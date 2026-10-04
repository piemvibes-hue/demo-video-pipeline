# demo-video-pipeline

把「一个真实产品的操作」剪成一条 2–3 分钟、配音字幕完全同步的演示视频的可复用管线。从黑客松参赛作品（[EmpathyDesk 演示视频](https://github.com/piemvibes-hue/empathy-desk)）沉淀——评委评审结论 85→达标的全过程。

```
镜头采集        剪辑合并         配音生成          词级对齐          场景合成
playwright ──▶ ffmpeg ──▶ IndexTTS-2/edge-tts ──▶ whisper+difflib ──▶ Remotion ──▶ demo.mp4
录屏 webm      裁死帧拼场景     VO稿=单一文本源      timing.ts        字幕/徽标/壳
```

## 为什么不是直接录屏

- 评委要「一目了然展示核心功能和交互流程」——纯录屏节奏松散、信息密度低
- 手工对轨（剪辑软件里挪字幕）做不出逐字高亮；这套管线让**配音稿成为唯一文本源**，字幕时间戳由 whisper 识别反推，永远同步
- 场景切换、徽标时机、浏览器壳这些「看起来像专业剪辑」的部分全是代码，可复现可 diff

## 给 agent 用（跨工具）

仓库根目录本身就是一个合法 skill 目录（SKILL.md + scripts/ + docs/）。装进你的工具：

| 工具 | 装法 |
|---|---|
| Claude Code | `git clone` 后复制为 `<项目>/.claude/skills/demo-video-pipeline/`（或 `~/.claude/skills/` 全局） |
| Codex | 复制为 `<项目>/.codex/skills/demo-video-pipeline/` |
| Devin | 复制为 `<项目>/.devin/skills/demo-video-pipeline/` |
| 其他 agent | 直接喂 `SKILL.md` 作上下文，脚本按相对路径调用 |

详见 [AGENTS.md](AGENTS.md)（agent 执行契约：该做什么、不要做什么）。

## 快速开始

```bash
# 1. 录镜头（playwright）
cd my-project && npm i playwright
BASE=https://yourapp.com OUT=./clips node ../demo-video-pipeline/scripts/record-clips.cjs

# 2. 剪场景素材（按 dry-run 时间轴选区间）
../demo-video-pipeline/scripts/cut-merge.sh clips/feature.mp4 "clips/feature.webm:8:21" "clips/feature2.webm:6:13"
mkdir -p template/public/clips template/public/audio && cp clips/*.mp4 template/public/clips/

# 3. 配音（改 template/src/constants.ts 的 VO 稿 → 生成 wav/mp3）
cd demo-video-pipeline
PROJECT=template TTS_HOME=/path/to/index-tts REF=voices/ref.wav python3 scripts/gen-tts.py
# 没有 IndexTTS-2 就用 edge-tts：pip install edge-tts && python3 scripts/gen-tts.py

# 4. 词级对齐（whisper → timing.ts + 重写 SCENES 时长）
pip install openai-whisper
PROJECT=template python3 scripts/sync-timing.py

# 5. 渲染
cd template && npm i && npx remotion render src/index.ts demo out/demo.mp4
```

## 仓库结构

```
scripts/
  record-clips.cjs   playwright 分段录屏模板（每段独立 context，动作间必须 sleep）
  cut-merge.sh       ffmpeg 子区间裁剪+合并
  gen-tts.py         VO稿→配音（IndexTTS-2 克隆 / edge-tts 备用，已有文件自动跳过）
  sync-timing.py     whisper 词级→逐字 timing.ts + 回写 SCENES 时长
template/            Remotion 工程骨架：SyncedCaption/时机徽标/浏览器壳/渐变底
docs/method.md       方法论：叙事结构、镜头设计、配音稿写法、坑位清单
SKILL.md             AI 助手版：交给 coding agent 端到端照做的技能文件
```

## 核心设计决策

| 决策 | 原因 |
|---|---|
| VO 稿是唯一文本源 | 字幕/时长/徽标时机全部由它派生，改稿即改片 |
| Whisper 软对齐回稿 | TTS 会把「95%」念成「百分之九十五」，硬匹配必死 |
| 句级断句字幕 | 一次一行，评委扫读；整段糊屏跟不上 |
| 徽标绑 `said("短语")` | 念到那句话徽标才出现，评委注意力被牵着走 |
| `from` 跳到动作点 | 录屏的登录/加载死帧全裁，画面不滞后口播 |

详见 [docs/method.md](docs/method.md)。

## License

MIT — 拿走改，署名随意。
