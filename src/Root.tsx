import React from "react";
import {Composition} from "remotion";
import {MainComposition} from "./MainComposition";
import data from "../public/scenes.json";
import type {ScenesData} from "./types";

const scenesData = data as ScenesData;
const FPS = scenesData.fps ?? 30;

export const Root: React.FC = () => {
  return (
    <Composition
      id="CartoonExplainer"
      component={MainComposition}
      durationInFrames={Math.max(1, Math.ceil(scenesData.duration * FPS))}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{data: scenesData}}
    />
  );
};
