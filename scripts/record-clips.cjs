// 镜头采集模板（Playwright）—— 每段一个独立 context + recordVideo，login 一次复用
// 用法：BASE=... OUT=./clips node record-clips.cjs
// 要点：
//  - recordVideo 只能开在 context 上，录完 ctx.close() 才落盘 .webm
//  - 每段独立 context：登录态靠 storageState 复用，或每段重走登录按钮（慢但稳）
//  - 动作之间必须 sleep：SPA 渲染/动画/接口都有延迟，急点会录到半加载帧
//  - 录制前先走一遍 dry run 拿时间轴：每个动作在素材第几秒发生，剪辑点位从这里来
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:5173';
const OUT = process.env.OUT || './clips';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function seg(browser, name, fn, { login = true } = {}) {
  const dir = `${OUT}/${name}`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,           // 录屏素材用 1；截图素材另开 dsf=2/3 的高清段
    locale: 'zh-CN',
    recordVideo: { dir, size: { width: 1920, height: 1080 } },
  });
  const page = await ctx.newPage();
  try {
    if (login) {
      // === 改成你的登录路径 ===
      await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /演示|Demo|Sign in/ }).first().click();
      await sleep(2500);
    }
    await fn(page);
  } catch (e) {
    console.log(name, 'ERROR:', String(e).slice(0, 300));
    await page.screenshot({ path: `${OUT}/${name}-error.png` }).catch(() => {});
  }
  await ctx.close(); // 落盘
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.webm'));
  if (files.length) fs.renameSync(`${dir}/${files[0]}`, `${OUT}/${name}.webm`);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(name, 'done');
}

(async () => {
  const browser = await chromium.launch();

  // 示例三段：每段里注释掉的动作即「时间轴标记」——成片按这个顺序裁
  await seg(browser, 'overview', async (page) => {
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
    await sleep(3000);                          // ~3s 数据就绪
    await page.mouse.move(960, 540);
    for (let i = 0; i < 4; i++) {               // ~4-10s 慢扫展示盘面
      await page.mouse.wheel(0, 260); await sleep(1200);
    }
    await sleep(2000);
  });

  await seg(browser, 'feature', async (page) => {
    // 点开 → 等渲染 → 真实操作一遍 → 停在对结果的状态上
    await page.waitForSelector('text=工作台', { timeout: 25000 }).catch(() => {});
    await sleep(2000);
    // …你的操作序列…
    await sleep(2000);
  });

  await browser.close();
})();
