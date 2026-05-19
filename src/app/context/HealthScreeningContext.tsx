import React, { createContext, useContext, useState } from "react";
type HealthPrediction = {
  disease: string;
  confidence: number;
};
/**
 * State structure for health screening feature
 *
 * Stores uploaded image, prediction result, and related metadata
 */
type HealthScreeningState = {
  selectedImage: string | null;
  selectedFileName: string | null;
  result: HealthPrediction[] | null;
  matchedCareGuidePetId: string | null;
  careGuideLookupDone: boolean;
  error: string | null;
};

/**
 * Initial default state for health screening flow
 */
const initialHealthScreeningState: HealthScreeningState = {
  selectedImage: null,
  selectedFileName: null,
  result: null,
  matchedCareGuidePetId: null,
  careGuideLookupDone: false,
  error: null,
};

/**
 * Context value type for health screening
 */
type HealthScreeningContextValue = {
  screening: HealthScreeningState;
  setScreening: React.Dispatch<React.SetStateAction<HealthScreeningState>>;
  resetScreening: () => void;
};

/**
 * React context for health screening feature
 * Used to share screening state across multiple components
 */
const HealthScreeningContext =
  createContext<HealthScreeningContextValue | null>(null);

/**
 * Provider component for Health Screening feature
 *
 * Responsibilities:
 * - Store screening state globally within feature
 * - Provide update and reset functions
 */
export function HealthScreeningProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * Main screening state container
   */
  const [screening, setScreening] = useState<HealthScreeningState>(
    initialHealthScreeningState,
  );

  /**
   * Reset screening state back to initial values
   */
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

/**
 * Hook to access HealthScreening context
 *
 * Throws error if used outside provider
 */
export function useHealthScreening() {
  const context = useContext(HealthScreeningContext);

  if (!context) {
    throw new Error(
      "useHealthScreening must be used inside HealthScreeningProvider",
    );
  }

  return context;
}
