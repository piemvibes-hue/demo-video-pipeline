// 演示视频通用组件集 —— 渐变底/入出场/浏览器壳/录屏/句级字幕/徽标/数字标/垫乐
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
  spring,
} from "remotion";
import { C, FONT } from "./constants";
import { AUDIO_TIMING } from "./timing";

// ---------- GradientBackground：双色光斑漂移渐变底 ----------
export const GradientBackground: React.FC<{
  variant?: "default" | "warm" | "cool" | "dramatic" | "calm";
}> = ({ variant = "default" }) => {
  const frame = useCurrentFrame();
  const drift1 = Math.sin(frame / 90) * 60;
  const drift2 = Math.cos(frame / 70) * 50;
  const presets: Record<string, [string, string, number]> = {
    default: [C.brand, "#7DD3FC", 0.22],
    cool: ["#2563EB", "#7DD3FC", 0.28],
    warm: ["#F59E0B", C.accent, 0.18],
    dramatic: ["#F87171", C.brand, 0.3],
    calm: [C.brand, "#34D399", 0.16],
  };
  const [c1, c2, op] = presets[variant];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: 120 + drift1,
          top: -260 + drift2,
          background: `radial-gradient(circle, ${c1}${Math.round(op * 255)
            .toString(16)
            .padStart(2, "0")} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          right: 60 - drift2,
          bottom: -300 + drift1 * 0.6,
          background: `radial-gradient(circle, ${c2}${Math.round(op * 255 * 0.8)
            .toString(16)
            .padStart(2, "0")} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- FadeSlide：弹性入场 ----------
export const FadeSlide: React.FC<{
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, direction = "up", distance = 28, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.8 } });
  const dir = {
    up: [0, distance],
    down: [0, -distance],
    left: [distance, 0],
    right: [-distance, 0],
  }[direction];
  return (
    <div
      style={{
        opacity: s,
        transform: `translate(${dir[0] * (1 - s)}px, ${dir[1] * (1 - s)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- SceneTransition：首尾 15 帧交叉淡入淡出 ----------
export const SceneTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

// ---------- BrowserFrame：浏览器壳 ----------
export const BrowserFrame: React.FC<{
  url?: string;
  tabTitle?: string;
  width?: number;
  children: React.ReactNode;
  enterDelay?: number;
  style?: React.CSSProperties;
}> = ({ url = "yourapp.example.com", tabTitle = "My App", width = 1360, children, enterDelay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - enterDelay, fps, config: { damping: 14, mass: 0.9 } });
  return (
    <div
      style={{
        width,
        borderRadius: 18,
        overflow: "hidden",
        background: C.card,
        boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(148,163,184,0.14)",
        transform: `scale(${0.94 + s * 0.06}) translateY(${(1 - s) * 40}px)`,
        opacity: s,
        ...style,
      }}
    >
      <div
        style={{
          height: 52,
          background: "#0E1526",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {["#F87171", "#FBBF24", "#34D399"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            height: 32,
            borderRadius: 16,
            background: "rgba(148,163,184,0.12)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            color: C.soft,
            fontSize: 15,
            fontFamily: FONT,
          }}
        >
          {url}
        </div>
        <div style={{ color: C.muted, fontSize: 13, fontFamily: FONT }}>{tabTitle}</div>
      </div>
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>{children}</div>
    </div>
  );
};

// ---------- ScreenRecording / ShotImage：素材进壳 ----------
export const ScreenRecording: React.FC<{ src: string; from?: number; rate?: number }> = ({ src, from = 0, rate = 1 }) => {
  const { fps } = useVideoConfig();
  return (
    <Video
      src={staticFile(src)}
      startFrom={Math.round(from * fps)}
      playbackRate={rate}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

export const ShotImage: React.FC<{ src: string }> = ({ src }) => (
  <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
);

// ---------- SyncedCaption：句级断句 + 词级卡拉OK ----------
// 一次只显示当前句（句号/问号/叹号/分号/破折号断句），句内逐字高亮——
// 不要把整段糊在屏上，评委扫读跟不上。
export const SyncedCaption: React.FC<{ scene: string }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const timing = AUDIO_TIMING[scene];
  if (!timing) return null;
  type Word = (typeof timing.words)[number];
  const groups: Word[][] = [];
  let cur: Word[] = [];
  for (const w of timing.words) {
    cur.push(w);
    if (/^[。！？；…]$/.test(w.text) || w.text === "——" || w.text === "—") {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  let gi = groups.findIndex((g) => t < g[g.length - 1].end + 0.35);
  if (gi < 0) gi = groups.length - 1;
  const shown = groups[gi];
  return (
    <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, textAlign: "center", padding: "0 140px" }}>
      <div
        style={{
          display: "inline-block",
          background: "rgba(6,10,20,0.72)",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          padding: "14px 30px",
          maxWidth: "76%",
          border: "1px solid rgba(148,163,184,0.16)",
        }}
      >
        {shown.map((w, i) => {
          const spoken = t >= w.start;
          const curw = t >= w.start && t <= w.end;
          return (
            <span
              key={i}
              style={{
                color: curw ? C.gold : spoken ? "#FFFFFF" : "rgba(255,255,255,0.38)",
                fontWeight: curw ? 700 : 400,
                fontSize: 27,
                fontFamily: FONT,
                marginRight: 2,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// 中文短语→配音时刻：在逐字 token 串里按字符偏移找起点（词索引≠字索引，别直接用数组下标）
export const mentionAt = (scene: string, phrase: string): number => {
  const timing = AUDIO_TIMING[scene];
  if (!timing) return Infinity;
  const joined = timing.words.map((w) => w.text).join("");
  const i = joined.indexOf(phrase);
  if (i < 0) return Infinity;
  let acc = 0;
  for (const w of timing.words) {
    acc += w.text.length;
    if (acc > i) return w.start;
  }
  return Infinity;
};

// useSync：said("短语") → 念到该短语那一刻返回 true（徽标/高亮的时机触发器）
export const useSync = (scene: string) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const said = (phrase: string, fb = 9999) => (AUDIO_TIMING[scene] ? t >= mentionAt(scene, phrase) : frame > fb);
  return { t, frame, said };
};

// ---------- FeatureBadge：胶囊徽标 ----------
export const FeatureBadge: React.FC<{ label: string; color?: string }> = ({ label, color = C.brand }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 22px",
      borderRadius: 999,
      background: `${color}26`,
      border: `1px solid ${color}55`,
      color: C.ink,
      fontSize: 22,
      fontFamily: FONT,
      fontWeight: 600,
    }}
  >
    <div style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
    {label}
  </div>
);

// ---------- TypewriterText：逐字打字 ----------
export const TypewriterText: React.FC<{ text: string; startFrame?: number; cps?: number; style?: React.CSSProperties }> = ({
  text,
  startFrame = 0,
  cps = 8,
  style,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - startFrame) * (cps / 30))));
  const shown = text.slice(0, n);
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={{ fontFamily: FONT, ...style }}>
      {shown}
      <span style={{ opacity: blink ? 1 : 0 }}>▍</span>
    </span>
  );
};

// ---------- BackgroundMusic：全片垫乐（放入 public/bgm.mp3） ----------
export const BackgroundMusic: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 90, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  return <Audio src={staticFile("bgm.mp3")} volume={0.16 * fadeIn * fadeOut} loop />;
};

// ---------- Stat：大数字冲击标 ----------
export const Stat: React.FC<{ value: string; label: string; color?: string; delay?: number }> = ({
  value,
  label,
  color = C.ink,
  delay = 0,
}) => (
  <FadeSlide delay={delay}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 76, fontWeight: 800, color, fontFamily: FONT, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 22, color: C.soft, fontFamily: FONT, marginTop: 8 }}>{label}</div>
    </div>
  </FadeSlide>
);
