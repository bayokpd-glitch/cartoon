import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {Scene, ScenesData} from "./types";

type Props = {
  data: ScenesData;
};

const ink = "#101010";
const paper = "#fffdf7";
const warm = "#f8df62";
const blue = "#5ab4e8";
const green = "#58a85e";
const red = "#e3362d";
const muted = "#6a665f";

function useSceneTime(scene: Scene) {
  const {fps} = useVideoConfig();
  const from = Math.max(0, Math.round(scene.start * fps));
  const durationInFrames = Math.max(1, Math.round((scene.end - scene.start) * fps));
  return {from, durationInFrames};
}

function useSceneDuration(scene: Scene) {
  const {fps} = useVideoConfig();
  return Math.max(1, Math.round((scene.end - scene.start) * fps));
}

function SceneTransition({children, durationInFrames}: {children: React.ReactNode; durationInFrames: number}) {
  const frame = useCurrentFrame();
  const fadeFrames = Math.min(10, Math.max(5, Math.floor(durationInFrames / 4)));
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - fadeFrames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>{children}</AbsoluteFill>;
}

const DoodleOverlay: React.FC<{light?: boolean}> = ({light = true}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: "none", opacity: 0.75}}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 24 + i * 13,
            height: 4,
            left: `${9 + i * 19}%`,
            top: `${15 + (i % 3) * 24}%`,
            borderRadius: 8,
            background: light ? "rgba(0,0,0,0.055)" : "rgba(255,255,255,0.065)",
            transform: `rotate(${i % 2 === 0 ? -4 : 5}deg) translateY(${Math.sin(frame * 0.04 + i) * 2}px)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const FrameChrome: React.FC<{data: ScenesData}> = ({data}) => (
  <AbsoluteFill style={{pointerEvents: "none"}}>
    <div
      style={{
        position: "absolute",
        left: 42,
        top: 34,
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "rgba(16,16,16,0.62)",
        fontFamily: "Arial, sans-serif",
        fontSize: 22,
        fontWeight: 800,
      }}
    >
      <div style={{width: 30, height: 30, border: `4px solid ${ink}`, borderRadius: 18, background: warm}} />
      <span>{data.channel}</span>
    </div>
  </AbsoluteFill>
);

const Caption: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!scene.show_caption) return null;
  const localTime = frame / fps;
  const activeChunk = scene.caption_chunks?.find((chunk) => localTime >= chunk.start && localTime < chunk.end);
  if (scene.caption_chunks?.length && !activeChunk) return null;
  const fallbackText = scene.text.split(/\s+/).slice(0, 6).join(" ");
  const text = activeChunk?.text || fallbackText;
  const words = activeChunk?.words?.length
    ? activeChunk.words
    : text.split(/\s+/).filter(Boolean).map((word) => ({text: word, start: 0, end: Number.POSITIVE_INFINITY}));
  const captionLength = text.replace(/\s+/g, " ").trim().length;
  const captionFontSize =
    captionLength > 40 ? 38 :
    captionLength > 34 ? 42 :
    captionLength > 28 ? 46 :
    captionLength > 22 ? 50 :
    58;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 42,
        width: "fit-content",
        maxWidth: "calc(100% - 92px)",
        padding: "14px 28px 16px",
        color: ink,
        fontFamily: "Arial, sans-serif",
        fontSize: captionFontSize,
        lineHeight: 1,
        fontWeight: 900,
        textAlign: "center",
        whiteSpace: "nowrap",
        background: "rgba(255,253,247,0.94)",
        border: `6px solid ${ink}`,
        borderRadius: 4,
        boxShadow: "7px 7px 0 rgba(0,0,0,0.22)",
        transform: "translateX(-50%)",
        textTransform: "uppercase",
      }}
    >
      {words.map((word, index) => (
        <React.Fragment key={`${word.text}-${index}`}>
          {index > 0 ? " " : ""}
          <span>{word.text}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

const ImageScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const durationInFrames = useSceneDuration(scene);
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wiggle = Math.sin(frame * 0.08) * 1.5;
  const scale =
    scene.motion === "zoom_out" ? 1.055 - progress * 0.035 :
    scene.motion === "zoom_in" ? 1.01 + progress * 0.045 :
    1.018;
  const x =
    scene.motion === "pan_left" ? interpolate(progress, [0, 1], [18, -18]) :
    scene.motion === "pan_right" ? interpolate(progress, [0, 1], [-18, 18]) :
    Math.sin(frame * 0.025) * 3;
  const y = scene.motion === "float" ? Math.sin(frame * 0.035) * 7 : wiggle;

  return (
    <AbsoluteFill style={{background: paper, overflow: "hidden"}}>
      {scene.image && (
        <Img
          src={staticFile(scene.image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "auto",
            transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${wiggle * 0.08}deg)`,
          }}
        />
      )}
      <DoodleOverlay />
    </AbsoluteFill>
  );
};

const HeadlineScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [0, 16], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: warm,
        color: ink,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        padding: "0 150px",
      }}
    >
      <DoodleOverlay />
      <div style={{fontSize: 124, lineHeight: 0.96, fontWeight: 900, textAlign: "center", transform: `scale(${pop})`}}>
        {scene.headline}
      </div>
      <div style={{marginTop: 42, fontSize: 42, lineHeight: 1.18, maxWidth: 1100, textAlign: "center", fontWeight: 700}}>
        {scene.text}
      </div>
    </AbsoluteFill>
  );
};

const QuestionScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const qScale = 1 + Math.sin(frame * 0.07) * 0.04;
  return (
    <AbsoluteFill
      style={{
        background: paper,
        color: ink,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        padding: 120,
      }}
    >
      <DoodleOverlay />
      <div
        style={{
          fontSize: 320,
          lineHeight: 0.8,
          fontWeight: 900,
          color: red,
          WebkitTextStroke: `10px ${ink}`,
          transform: `scale(${qScale}) rotate(${Math.sin(frame * 0.04) * 3}deg)`,
        }}
      >
        ?
      </div>
      <div style={{marginTop: 42, fontSize: 62, lineHeight: 1.12, maxWidth: 1250, textAlign: "center", fontWeight: 900}}>
        {scene.text}
      </div>
    </AbsoluteFill>
  );
};

const QuoteScene: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill
    style={{
      background: blue,
      color: ink,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "0 190px",
    }}
  >
    <DoodleOverlay />
    <div
      style={{
        background: paper,
        border: `8px solid ${ink}`,
        borderRadius: 12,
        padding: "70px 80px",
        boxShadow: "14px 14px 0 rgba(0,0,0,0.22)",
        transform: "rotate(-1deg)",
      }}
    >
      <div style={{fontSize: 76, lineHeight: 1.08, fontWeight: 900, textAlign: "center"}}>
        {scene.quote || scene.text}
      </div>
      {scene.speaker && (
        <div style={{marginTop: 34, fontSize: 34, color: muted, textAlign: "center", fontWeight: 900}}>
          {scene.speaker}
        </div>
      )}
    </div>
  </AbsoluteFill>
);

const ListScene: React.FC<{scene: Scene}> = ({scene}) => {
  const items = scene.timeline_items?.length ? scene.timeline_items : [scene.text];
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: paper, color: ink, fontFamily: "Arial, sans-serif", padding: "120px 170px"}}>
      <DoodleOverlay />
      <div style={{fontSize: 84, lineHeight: 1, fontWeight: 900, marginBottom: 58}}>{scene.headline}</div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34}}>
        {items.map((item, i) => {
          const opacity = interpolate(frame, [i * 10, i * 10 + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity,
                display: "flex",
                gap: 22,
                alignItems: "flex-start",
                fontSize: 42,
                lineHeight: 1.1,
                fontWeight: 800,
              }}
            >
              <span style={{color: i % 2 === 0 ? green : red, fontSize: 54}}>{i % 2 === 0 ? "✓" : "×"}</span>
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const FallbackCard: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill
    style={{
      background: warm,
      color: ink,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "0 160px",
    }}
  >
    <DoodleOverlay />
    <div style={{fontSize: 86, lineHeight: 1.02, fontWeight: 900, textAlign: "center", maxWidth: 1300}}>
      {scene.headline}
    </div>
    <div style={{marginTop: 36, fontSize: 42, lineHeight: 1.18, fontWeight: 800, textAlign: "center", maxWidth: 1180}}>
      {scene.text}
    </div>
  </AbsoluteFill>
);

const RenderScene: React.FC<{scene: Scene}> = ({scene}) => {
  if (scene.image) return <ImageScene scene={scene} />;
  if (scene.type === "headline") return <HeadlineScene scene={scene} />;
  if (scene.type === "question" || scene.type === "symbolic") return <QuestionScene scene={scene} />;
  if (scene.type === "quote") return <QuoteScene scene={scene} />;
  if (scene.type === "list") return <ListScene scene={scene} />;
  return <FallbackCard scene={scene} />;
};

const SceneSequence: React.FC<{scene: Scene; index: number}> = ({scene, index}) => {
  const timing = useSceneTime(scene);
  return (
    <Sequence key={`${scene.start}-${index}`} from={timing.from} durationInFrames={timing.durationInFrames}>
      <SceneTransition durationInFrames={timing.durationInFrames}>
        <RenderScene scene={scene} />
      </SceneTransition>
      <Caption scene={scene} />
    </Sequence>
  );
};

const EndingCard: React.FC<{data: ScenesData}> = ({data}) => (
  <AbsoluteFill
    style={{
      background: green,
      color: ink,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "0 170px",
    }}
  >
    <DoodleOverlay />
    <div style={{fontSize: 46, fontWeight: 900, marginBottom: 28}}>{data.ending?.headline || "Thanks for watching"}</div>
    <div style={{fontSize: 98, lineHeight: 1, fontWeight: 900, textAlign: "center", maxWidth: 1250}}>
      {data.ending?.text || data.title}
    </div>
  </AbsoluteFill>
);

export const MainComposition: React.FC<Props> = ({data}) => {
  const {durationInFrames} = useVideoConfig();
  const endingFrames = Math.min(120, Math.max(72, Math.floor(durationInFrames * 0.07)));
  const endingStart = Math.max(0, durationInFrames - endingFrames);

  return (
    <AbsoluteFill style={{backgroundColor: paper}}>
      {data.audio && <Audio src={staticFile(data.audio)} />}

      {data.scenes.map((scene, i) => (
        <SceneSequence key={`${scene.start}-${i}`} scene={scene} index={i} />
      ))}

      <Sequence from={endingStart} durationInFrames={durationInFrames - endingStart}>
        <SceneTransition durationInFrames={durationInFrames - endingStart}>
          <EndingCard data={data} />
        </SceneTransition>
      </Sequence>

      <FrameChrome data={data} />
    </AbsoluteFill>
  );
};
