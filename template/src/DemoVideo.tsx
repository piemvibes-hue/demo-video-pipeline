import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { FPS, SCENES } from "./constants";
import { HookScene, FeatureScene, ClosingScene } from "./scenes";
import { BackgroundMusic } from "./components";

const SCENE_EL: Record<string, React.FC> = {
  hook: HookScene,
  feature: FeatureScene,
  closing: ClosingScene,
};

export const DemoVideo: React.FC = () => {
  const last = Object.values(SCENES).reduce((a, b) => (a.start + a.dur > b.start + b.dur ? a : b));
  const totalFrames = Math.ceil((last.start + last.dur) * FPS);
  return (
    <AbsoluteFill>
      {Object.entries(SCENES).map(([name, s]) => {
        const El = SCENE_EL[name];
        return El ? (
          <Sequence key={name} from={Math.round(s.start * FPS)} durationInFrames={Math.round(s.dur * FPS)}>
            <El />
          </Sequence>
        ) : null;
      })}
      <BackgroundMusic durationInFrames={totalFrames} />
    </AbsoluteFill>
  );
};

export const totalDurationFrames = () => {
  const last = Object.values(SCENES).reduce((a, b) => (a.start + a.dur > b.start + b.dur ? a : b));
  return Math.ceil((last.start + last.dur) * FPS);
};
