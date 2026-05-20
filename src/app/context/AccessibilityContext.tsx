import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type TextSize = "regular" | "large" | "extra-large";

type AccessibilityContextValue = {
  textSize: TextSize;
  setTextSize: (textSize: TextSize) => void;
  textSizeOptions: Array<{
    label: string;
    value: TextSize;
  }>;
};

const textSizeOptions: AccessibilityContextValue["textSizeOptions"] = [
  { label: "Regular", value: "regular" },
  { label: "Large", value: "large" },
  { label: "Extra large", value: "extra-large" },
];

const fontSizeByTextSize: Record<TextSize, string> = {
  regular: "16px",
  large: "18px",
  "extra-large": "20px",
};

const storageKey = "jagapet-text-size";

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

function isTextSize(value: string | null): value is TextSize {
  return value === "regular" || value === "large" || value === "extra-large";
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    if (typeof window === "undefined") return "regular";

    const savedTextSize = window.localStorage.getItem(storageKey);
    return isTextSize(savedTextSize) ? savedTextSize : "regular";
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-size",
      fontSizeByTextSize[textSize],
    );
    document.documentElement.dataset.textSize = textSize;
    window.localStorage.setItem(storageKey, textSize);
  }, [textSize]);

  const value = useMemo(
    () => ({
      textSize,
      setTextSize,
      textSizeOptions,
    }),
    [textSize],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider",
    );
  }

  return context;
}
