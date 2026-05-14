import { useEffect, useState } from "react";
import type { Language } from "../context/LanguageContext";
import { translateText } from "../utils/translateText";

export function useTranslatedText(
  text: string | null | undefined,
  language: Language,
) {
  const originalText = text?.trim() ?? "";
  const [translatedText, setTranslatedText] = useState(originalText);

  useEffect(() => {
    let cancelled = false;

    if (!originalText) {
      setTranslatedText("");
      return;
    }

    if (language === "en") {
      setTranslatedText(originalText);
      return;
    }

    setTranslatedText(originalText);

    translateText(originalText, language)
      .then((result) => {
        if (!cancelled) {
          setTranslatedText(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTranslatedText(originalText);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [originalText, language]);

  return translatedText;
}
