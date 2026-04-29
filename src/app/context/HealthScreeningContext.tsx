import React, { createContext, useContext, useState } from "react";

type HealthScreeningState = {
  selectedImage: string | null;
  selectedFileName: string | null;
  result: string | null;
  matchedCareGuidePetId: string | null;
  careGuideLookupDone: boolean;
  error: string | null;
};

const initialHealthScreeningState: HealthScreeningState = {
  selectedImage: null,
  selectedFileName: null,
  result: null,
  matchedCareGuidePetId: null,
  careGuideLookupDone: false,
  error: null,
};

type HealthScreeningContextValue = {
  screening: HealthScreeningState;
  setScreening: React.Dispatch<React.SetStateAction<HealthScreeningState>>;
  resetScreening: () => void;
};

const HealthScreeningContext =
  createContext<HealthScreeningContextValue | null>(null);

export function HealthScreeningProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [screening, setScreening] = useState<HealthScreeningState>(
    initialHealthScreeningState,
  );

  const resetScreening = () => {
    setScreening(initialHealthScreeningState);
  };

  return (
    <HealthScreeningContext.Provider
      value={{
        screening,
        setScreening,
        resetScreening,
      }}
    >
      {children}
    </HealthScreeningContext.Provider>
  );
}

export function useHealthScreening() {
  const context = useContext(HealthScreeningContext);

  if (!context) {
    throw new Error(
      "useHealthScreening must be used inside HealthScreeningProvider",
    );
  }

  return context;
}