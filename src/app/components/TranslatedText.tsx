// src/components/TranslatedText.tsx

import type { Language } from "../context/LanguageContext";
import { useTranslatedText } from "../hooks/useTranslatedText";

type TranslatedTextProps = {
  text: string | null | undefined;
  language: Language;
  className?: string;
};

export function TranslatedText({
  text,
  language,
  className,
}: TranslatedTextProps) {
  const translatedText = useTranslatedText(text, language);

  if (!text) {
    return null;
  }

  return <span className={className}>{translatedText}</span>;
}