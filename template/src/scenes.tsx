// 场景骨架示例 —— 三场最简叙事：钩子 → 功能实操 → 收尾
// 复用模式：ClipStage（录屏进壳）+ BadgeRow（时机徽标）+ SyncedCaption（字幕）
import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig, OffthreadVideo } from "remotion";
import { C, FONT, VOICE_BASE } from "./constants";
import {
  BrowserFrame,
  FadeSlide,
  FeatureBadge,
  GradientBackground,
  SceneTransition,
  Stat,
  SyncedCaption,
  useSceneOut,
  useSync,
} from "./components";

const center: React.CSSProperties = {
  // position:relative is load-bearing: it lifts this container into the
  // positioned paint layer so its children render ABOVE GradientBackground's
  // opaque AbsoluteFill (a positioned sibling always paints over static ones,
  // regardless of DOM order). Without it, plain untransformed children vanish.
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};

// ---------- ClipStage：录屏 + 浏览器壳 一站组合 ----------
// src=public/ 下的录屏；from=跳过素材前 N 秒（裁掉登录/加载死帧，起点靠近动作点，
// 否则画面会滞后口播——评审挑毛病的重灾区）
export const ClipStage: React.FC<{
  src: string;
  url: string;
  tabTitle: string;
  rate?: number;
  from?: number;
  width?: number;
}> = ({ src, url, tabTitle, rate = 1, from = 0, width = 1500 }) => {
  const { fps } = useVideoConfig();
  return (
    <div style={center}>
      <BrowserFrame url={url} tabTitle={tabTitle} width={width}>
        <OffthreadVideo
          src={staticFile(src)}
          playbackRate={rate}
          startFrom={Math.round(from * fps)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </BrowserFrame>
    </div>
  );
};

export const BadgeRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const out = useSceneOut();
  return (
    <div style={{ position: "absolute", top: 92, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24, opacity: out }}>
      {children}
    </div>
  );
};

// ---------- S1 hook：大字钩子 → 产品渐显 ----------
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { said } = useSync("hook");
  const out = useSceneOut();
  const quoteIn = interpolate(frame, [10, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const videoReveal = interpolate(frame, [85, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneTransition fadeIn={false}>
      <GradientBackground variant="dramatic" />
      <Audio src={staticFile(`${VOICE_BASE}/hook.mp3`)} />
      <div style={center}>
        <div
          style={{
            opacity: quoteIn * out,
            transform: `scale(${0.92 + quoteIn * 0.08})`,
            fontSize: 92,
            fontWeight: 800,
            color: "#FFF",
            fontFamily: FONT,
            letterSpacing: 4,
            textShadow: "0 8px 60px rgba(239,68,68,0.35)",
          }}
        >
          “用户的抱怨，值得被听见”
        </div>
        <div style={{ marginTop: 40, opacity: videoReveal, transform: `translateY(${(1 - videoReveal) * 60}px)` }}>
          <BrowserFrame url="yourapp.example.com" tabTitle="My App" width={1240}>
            <OffthreadVideo src={staticFile("clips/hero.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </BrowserFrame>
        </div>
      </div>
      {said("被听见", 200) && (
        <div style={{ position: "absolute", top: 92, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: out }}>
          <FadeSlide delay={0}>
            <FeatureBadge label="这是产品要回答的问题" color={C.danger} />
          </FadeSlide>
        </div>
      )}
      <SyncedCaption scene="hook" />
    </SceneTransition>
  );
};

// ---------- S2 feature：录屏 + 时机徽标 ----------
export const FeatureScene: React.FC = () => {
  const { said } = useSync("feature");
  return (
    <SceneTransition>
      <GradientBackground variant="calm" />
      <Audio src={staticFile(`${VOICE_BASE}/feature.mp3`)} />
      <ClipStage src="clips/feature.mp4" from={5} url="yourapp.example.com" tabTitle="My App · 工作台" />
      <BadgeRow>
        {said("工作流", 120) && (
          <FadeSlide delay={0}>
            <FeatureBadge label="工作流 · 逐步可查" color={C.brand} />
          </FadeSlide>
        )}
        {said("成本", 420) && (
          <FadeSlide delay={0}>
            <FeatureBadge label="调用 · 成本透明" color={C.gold} />
          </FadeSlide>
        )}
      </BadgeRow>
      <SyncedCaption scene="feature" />
    </SceneTransition>
  );
};

// ---------- S3 closing：三数字 + 品牌收尾 ----------
export const ClosingScene: React.FC = () => {
  const { said } = useSync("closing");
  const pulse = useCurrentFrame();
  return (
    <SceneTransition>
      <GradientBackground variant="dramatic" />
      <Audio src={staticFile(`${VOICE_BASE}/closing.mp3`)} />
      <div style={center}>
        <div style={{ display: "flex", gap: 80, marginBottom: 50 }}>
          <Stat value="95%" label="准确率实测" color={C.ink} />
          <Stat value="100%" label="核心指标达标" color={C.gold} />
          <Stat value="<¥0.01" label="单次成本" color={C.brandLight} />
        </div>
        {said("开源底座", 150) && (
          <FadeSlide delay={0}>
            <div
              style={{
                fontSize: 30,
                color: C.soft,
                fontFamily: FONT,
                background: "rgba(59,130,246,0.10)",
                border: "1px solid rgba(59,130,246,0.25)",
                padding: "12px 34px",
                borderRadius: 999,
              }}
            >
              全部跑在开源大模型底座上
            </div>
          </FadeSlide>
        )}
        <FadeSlide delay={30}>
          <div style={{ fontSize: 48, fontWeight: 800, color: C.ink, fontFamily: FONT, marginTop: 56, transform: `translateY(${Math.sin(pulse / 16) * 5}px)` }}>
            你的产品名 <span style={{ color: C.brandLight, fontWeight: 600, fontSize: 30 }}>Product</span>
          </div>
        </FadeSlide>
      </div>
      <SyncedCaption scene="closing" />
    </SceneTransition>
  );
};
