export interface AnalysisRequest {
  name: string;
  style: string;
  preferEngine: "Gemini" | "DeepSeek";
}

export interface AnalysisResponse {
  name: string;
  characters: string[];
  homophones: string[];
  pinyin: string[];
  qiyu: string;
  hanyi: string;
  wuxing: string;
  engine: string;
}

export interface HistoryRecord {
  id: string;
  name: string;
  style: string;
  timestamp: number;
  result: AnalysisResponse;
}

export const POETIC_STYLES = [
  { id: "唐风古韵", name: "唐风古韵", desc: "气象万千，格律严整，豪迈开阔", example: "晨曦微露照华堂" },
  { id: "宋韵豪放", name: "宋韵豪放", desc: "词意豁达，胸怀宽广，山河辽阔", example: "豪气干云志高远" },
  { id: "仙侠唯美", name: "仙侠唯美", desc: "空灵超脱，仙气缥缈，清逸绝尘", example: "幻海星沙影飘渺" },
  { id: "江南雅致", name: "江南雅致", desc: "温婉细腻，烟雨朦胧，小桥流水", example: "烟雨江南听春雨" },
  { id: "现代抒情", name: "现代抒情", desc: "意象现代，感情真挚，温柔细腻", example: "微风吹拂着记忆" }
];

export const SAMPLE_NAMES = [
  "陈泽浩", "李白", "苏轼", "林徽因", "王维", "张居正"
];
