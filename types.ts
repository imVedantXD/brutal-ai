export type VictimType = "brand" | "code" | "resume" | "profile" | "custom";

export type BrutalityLevel = "sarcastic" | "doctor" | "absolute";

export type ThemeMode = "dark" | "clinical" | "cyberpunk" | "royal" | "amber" | "oled";
export type AccentColor = "orange" | "cyan" | "emerald" | "purple" | "gold" | "crimson";
export type LayoutDensity = "normal" | "dense" | "ultra";
export type FontMode = "sans" | "mono" | "serif";

export interface CritiquePoint {
  title: string;
  description: string;
}

export interface CritiqueResult {
  verdict: string;
  killerQuote: string;
  roastPoints: CritiquePoint[];
  remedyPoints: CritiquePoint[];
  strategicScore: number;
}

export interface VictimHistoryItem {
  id: string;
  timestamp: string;
  victimType: VictimType;
  title: string;
  content: string;
  image: string | null; // Base64 data url
  brutality: BrutalityLevel;
  result: CritiqueResult;
}

