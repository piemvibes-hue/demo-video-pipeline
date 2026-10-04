// 演示视频模板 —— 主题、场景表、配音稿（VO 是唯一文本源：TTS 与字幕对齐都从它生成）
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// ---------- 主题调色（改成你的产品色系即可）----------
export const C = {
  bg: "#0B1020",
  card: "#111A30",
  ink: "#F4F6FB",
  soft: "#AEB9D0",
  muted: "#6B7894",
  brand: "#3B82F6",
  brandLight: "#93C5FD",
  accent: "#A594C9",
  gold: "#FBBF24",
  ok: "#34D399",
  danger: "#F87171",
};

// 中文字体栈：思源黑体系优先，缺字体时退到系统黑体
export const FONT =
  '"Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei",system-ui,sans-serif';

// ---------- 场景表 ----------
// 由 scripts/sync-timing.py 按实际配音时长重写（dur = 配音时长 + CROSSFADE 余量）。
// 手动初排时按配音稿字数估：中文朗读约 4.5 字/秒。
export const SCENES: Record<string, { start: number; dur: number }> = {
  hook: { start: 0.0, dur: 10.0 },
  feature: { start: 9.5, dur: 14.0 },
  closing: { start: 23.0, dur: 12.0 },
};

export const VOICE_BASE = "audio";

// ---------- 分镜配音稿 ----------
// text 会原样送 TTS：口语化写，数字/英文照读法写（「V I P」「A I」「九成一点三」）。
// emo 全片统一一种语气；逐场景换情绪会让配音像多个人拼的。
export const VO: Record<string, { text: string; emo: string }> = {
  hook: {
    text: "用户的每一句抱怨，都值得被听见。这是我们的产品，也是这次要讲的故事。",
    emo: "路演讲解者：自信清晰、专业有说服力、节奏明快",
  },
  feature: {
    text: "点开工作流，每一步调了什么、为什么调、花了多少成本，全摊开在眼前。",
    emo: "路演讲解者：自信清晰、专业有说服力、节奏明快",
  },
  closing: {
    text: "三个数字收尾：准确率九成五，成本不到一分钱，全部跑在开源底座上。",
    emo: "路演讲解者：自信清晰、专业有说服力、节奏明快",
  },
};
