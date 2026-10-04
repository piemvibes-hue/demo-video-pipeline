import React from "react";
import { Composition } from "remotion";
import { FPS, WIDTH, HEIGHT } from "./constants";
import { DemoVideo, totalDurationFrames } from "./DemoVideo";

export const Root: React.FC = () => (
  <Composition
    id="demo"
    component={DemoVideo}
    durationInFrames={totalDurationFrames()}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
