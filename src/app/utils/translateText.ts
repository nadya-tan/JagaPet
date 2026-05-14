import type { Language } from "../context/LanguageContext";

type LingvaResponse = {
  translation?: string;
  error?: string;
};

const memoryCache = new Map<string, string>();

const LINGVA_API_BASE = "https://lingva.ml";

function getCacheKey(text: string, targetLanguage: Language) {
  return `translation:${targetLanguage}:${text}`;
}

export async function translateText(
  text: string | null | undefined,
  targetLanguage: Language,
) {
  const originalText = text?.trim();

  if (!originalText) {
    return "";
  }

  if (targetLanguage === "en") {
    return originalText;
  }

  const cacheKey = getCacheKey(originalText, targetLanguage);

  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }

  try {
    const localCached = localStorage.getItem(cacheKey);

    if (localCached) {
      memoryCache.set(cacheKey, localCached);
      return localCached;
    }
  } catch {
    // Ignore localStorage access errors.
  }

  const cleanBaseUrl = LINGVA_API_BASE.replace(/\/$/, "");

  const url = `${cleanBaseUrl}/api/v1/en/${targetLanguage}/${encodeURIComponent(
    originalText,
  )}`;

  const response = await fetch(url);
  const data = (await response.json()) as LingvaResponse;

  if (!response.ok || data.error || !data.translation) {
    throw new Error(data.error || "Translation failed.");
  }

  memoryCache.set(cacheKey, data.translation);

  try {
    localStorage.setItem(cacheKey, data.translation);
  } catch {
    // Ignore localStorage quota errors.
  }

  return data.translation;
}
