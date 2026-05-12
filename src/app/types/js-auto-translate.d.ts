declare module "js-auto-translate" {
  export function autoTranslate(
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<void>;

  export function translateText(
    text: string,
    targetLanguage: string,
  ): Promise<string>;

  export function getLanguages(): Promise<string[]>;
}
