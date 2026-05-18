import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations, languageLabels, type Language } from "../i18n";

const STORAGE_KEY = "shell-fin-language";

type TranslationValue = string | TranslationDictionary;

type TranslationDictionary = {
  readonly [key: string]: TranslationValue;
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  languageLabels: Record<Language, string>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getNestedTranslation(
  dictionary: TranslationDictionary,
  key: string,
): string | undefined {
  // Supports old flat style, for example:
  // { "home.alert": "Never Release Pets Into the Wild" }
  const exactValue = dictionary[key];

  if (typeof exactValue === "string") {
    return exactValue;
  }

  // Supports new nested style, for example:
  // { home: { alert: "Never Release Pets Into the Wild" } }
  const nestedValue = key
    .split(".")
    .reduce<TranslationValue | undefined>((current, part) => {
      if (
        current == null ||
        typeof current !== "object" ||
        !(part in current)
      ) {
        return undefined;
      }

      return current[part];
    }, dictionary);

  return typeof nestedValue === "string" ? nestedValue : undefined;
}

function getInitialLanguage(): Language {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);

  if (savedLanguage === "ms" || savedLanguage === "zh") {
    return savedLanguage;
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage: setLanguageState,
      languageLabels,
      t: (key) =>
        getNestedTranslation(
          translations[language] as TranslationDictionary,
          key,
        ) ??
        getNestedTranslation(translations.en as TranslationDictionary, key) ??
        key,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}

export type { Language };
