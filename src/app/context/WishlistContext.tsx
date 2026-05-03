import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * Wishlist context structure
 *
 * Provides global state for storing favorite items (by ID)
 */
interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

/**
 * React context for wishlist feature
 * Stores list of favorited item IDs
 */
const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  toggleWishlist: () => {},
  clearWishlist: () => {},
  isInWishlist: () => false,
});

/**
 * Hook to access wishlist context
 */
export const useWishlist = () => useContext(WishlistContext);

/**
 * Provider component for Wishlist feature
 *
 * Responsibilities:
 * - Manage wishlist state
 * - Provide add/remove/clear utilities
 */
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  /**
   * List of saved wishlist item IDs
   */
  const [wishlist, setWishlist] = useState<string[]>([]);

  /**
   * Add or remove item from wishlist
   *
   * Behavior:
   * - If item exists → remove it
   * - If not exists → add it
   */
  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  /**
   * Clear all wishlist items
   */
  const clearWishlist = () => setWishlist([]);

  /**
   * Check if item exists in wishlist
   */
  const isInWishlist = (id: string) => wishlist.includes(id);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
