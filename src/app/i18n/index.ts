import { en } from "./en";
import { ms } from "./ms";
import { zh } from "./zh";

export type Language = "en" | "ms" | "zh";

export const translations = {
  en,
  ms,
  zh,
} as const;

export const languageLabels: Record<Language, string> = {
  en: "English",
  ms: "Malay",
  zh: "中文",
};
