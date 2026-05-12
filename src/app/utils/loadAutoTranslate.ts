type AutoTranslateModule = {
  autoTranslate: (
    sourceLanguage: string,
    targetLanguage: string,
  ) => Promise<void>;
};

const AUTO_TRANSLATE_CDN_URL =
  "https://cdn.jsdelivr.net/gh/Mr-vero/AutoTranslate@v.1.0.3/dist/autoTranslate.js";

export async function loadAutoTranslate() {
  const module = await import(
    /* @vite-ignore */
    AUTO_TRANSLATE_CDN_URL
  );

  return module as AutoTranslateModule;
}
