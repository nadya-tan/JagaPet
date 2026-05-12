// import { useEffect, useState } from "react";
// import { useLanguage } from "../context/LanguageContext";
// import { translateText } from "../utils/translateText";

// type TranslatedTextProps = {
//   text: string | null | undefined;
//   className?: string;
// };

// export function TranslatedText({ text, className }: TranslatedTextProps) {
//   const { language } = useLanguage();
//   const [displayText, setDisplayText] = useState(text ?? "");

//   useEffect(() => {
//     const originalText = text ?? "";

//     setDisplayText(originalText);

//     if (!originalText.trim() || language === "en") {
//       return;
//     }

//     let isActive = true;

//     translateText(originalText, language)
//       .then((translatedText) => {
//         if (isActive) {
//           setDisplayText(translatedText);
//         }
//       })
//       .catch(() => {
//         if (isActive) {
//           setDisplayText(originalText);
//         }
//       });

//     return () => {
//       isActive = false;
//     };
//   }, [text, language]);

//   return <span className={className}>{displayText}</span>;
// }
