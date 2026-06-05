export type Scene = {
  type:
    | "image"
    | "headline"
    | "quote"
    | "question"
    | "list"
    | "fallback_card"
    | "symbolic"
    | "atmosphere";
  start: number;
  end: number;
  text: string;
  headline: string;
  image?: string;
  show_caption?: boolean;
  caption_chunks?: Array<{
    start: number;
    end: number;
    text: string;
    words?: Array<{
      text: string;
      start: number;
      end: number;
    }>;
  }>;
  motion?: "float" | "zoom_in" | "zoom_out" | "pan_left" | "pan_right";
  quote?: string;
  speaker?: string;
  timeline_items?: string[];
};

export type ScenesData = {
  title: string;
  channel: string;
  audio: string;
  duration: number;
  fps?: number;
  scenes: Scene[];
  ending?: {
    kind?: "next" | "subscribe";
    headline: string;
    text: string;
  };
};
