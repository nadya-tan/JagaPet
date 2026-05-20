import React from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useSpeech, type SpeechOptions } from "../hooks/useSpeech";

function prepareSpeechText(text: string, lang = "en-MY") {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (lang.startsWith("zh")) {
    return normalizedText
      .replace(/Under\s+(\d+)/gi, "$1岁以下")
      .replace(/(\d+)\s*[–—-]\s*(\d+)/g, "$1岁到$2岁")
      .replace(/(\d+)\s*\+/g, "$1岁以上")
      .replace(/(\d+)\s*\/\s*(\d+)/g, "第$1题，共$2题")
      .replace(/\s+/g, " ")
      .trim();
  }

  return normalizedText
    .replace(/Under\s+(\d+)/gi, "Under $1 years old")
    .replace(/(\d+)\s*[–—-]\s*(\d+)/g, "$1 to $2 years old")
    .replace(/(\d+)\s*\+/g, "$1 and above")
    .replace(/(\d+)\s*\/\s*(\d+)/g, "$1 of $2")
    .replace(/\s+/g, " ")
    .trim();
}

type SpeechButtonProps = {
  text: string | (() => string);
  label?: string;
  options?: SpeechOptions;
  variant?: "header" | "mobile";
  className?: string;
};

export function SpeechButton({
  text,
  label = "Read page",
  options = {},
  variant = "header",
  className = "",
}: SpeechButtonProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
  } = useSpeech();

  if (!isSupported) return null;

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
      return;
    }

    const speechText = typeof text === "function" ? text() : text;
    speak(prepareSpeechText(speechText, options.lang), options);
  };

  const handleStopSpeech = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    stop();
  };

  const isMobile = variant === "mobile";
  const wrapperClass = isMobile
    ? `flex items-center gap-2 ${className}`
    : `flex shrink-0 items-center gap-[8px] whitespace-nowrap ${className}`;
  const buttonClass = isMobile
    ? "inline-flex items-center justify-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-base font-medium text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
    : "inline-flex items-center justify-center gap-[6px] rounded-full border border-stone-200 bg-white px-[12px] py-[8px] text-[13px] font-semibold text-stone-700 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 xl:text-[14px]";
  const stopClass = isMobile
    ? "inline-flex items-center justify-center rounded-md bg-rose-50 px-3 py-2 text-base font-medium text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-600"
    : "inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-[12px] py-[8px] text-[13px] font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-600 xl:text-[14px]";
  const iconClass = "h-[16px] w-[16px]";

  const actionLabel = isSpeaking
    ? isPaused
      ? "Resume reading page"
      : "Pause reading page"
    : label;

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={handleToggleSpeech}
        className={buttonClass}
        aria-label={actionLabel}
      >
        {isSpeaking ? (
          isPaused ? (
            <Play className={iconClass} aria-hidden="true" />
          ) : (
            <Pause className={iconClass} aria-hidden="true" />
          )
        ) : (
          <Volume2 className={iconClass} aria-hidden="true" />
        )}
        <span>{isSpeaking ? (isPaused ? "Resume" : "Pause") : label}</span>
      </button>

      {isSpeaking && (
        <button
          type="button"
          onClick={handleStopSpeech}
          className={stopClass}
          aria-label="Stop reading page"
        >
          <VolumeX className={iconClass} aria-hidden="true" />
          <span className={isMobile ? "inline" : "sr-only"}>Stop</span>
        </button>
      )}
    </div>
  );
}
