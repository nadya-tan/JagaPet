import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Pet } from "../types/pet.types";

/**
 * Shape of Compare context state and actions
 */
type CompareContextType = {
  comparePets: Pet[];
  toggleCompare: (pet: Pet) => void;
  removeCompare: (petId: string) => void;
  clearCompare: () => void;
  isInCompare: (petId: string) => boolean;
  isCompareFull: boolean;
};

/**
 * React Context for compare feature
 * Stores selected pets for comparison
 */
const CompareContext = createContext<CompareContextType | null>(null);

/**
 * Local storage key for persisting compare list
 */
const STORAGE_KEY = "comparePets";

/**
 * Maximum number of pets allowed in comparison
 */
const MAX_COMPARE_ITEMS = 4;

/**
 * Provider component for Compare feature
 *
 * Responsibilities:
 * - Manage compare list state
 * - Persist data to localStorage
 * - Provide compare actions to child components
 */
export function CompareProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * Initialize compare list from localStorage (client-side only)
   */
  const [comparePets, setComparePets] = useState<Pet[]>(() => {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as Pet[];
    } catch {
      return [];
    }
  });

  /**
   * Sync comparePets state to localStorage whenever it changes
   */
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comparePets));
  }, [comparePets]);

  /**
   * Add or remove a pet from compare list
   *
   * Behavior:
   * - If pet exists → remove it
   * - If not exists → add it (unless limit reached)
   */
  const toggleCompare = (pet: Pet) => {
    setComparePets((current) => {
      const exists = current.some((item) => item.pet_id === pet.pet_id);

      // Remove if already in comparison
      if (exists) {
        return current.filter((item) => item.pet_id !== pet.pet_id);
      }

      // Prevent exceeding max comparison limit
      if (current.length >= MAX_COMPARE_ITEMS) {
        return current;
      }

      // Add new pet to comparison
      return [...current, pet];
    });
  };

  /**
   * Remove a specific pet from compare list by ID
   */
  const removeCompare = (petId: string) => {
    setComparePets((current) =>
      current.filter((item) => item.pet_id !== petId),
    );
  };

  /**
   * Clear entire compare list
   */
  const clearCompare = () => {
    setComparePets([]);
  };

  /**
   * Check whether a pet is already in compare list
   */
  const isInCompare = (petId: string) => {
    return comparePets.some((item) => item.pet_id === petId);
  };

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo(
    () => ({
      comparePets,
      toggleCompare,
      removeCompare,
      clearCompare,
      isInCompare,
      isCompareFull: comparePets.length >= MAX_COMPARE_ITEMS,
    }),
    [comparePets],
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

/**
 * Hook to access Compare context
 *
 * Throws error if used outside CompareProvider
 */
export function useCompare() {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }

  return context;
}