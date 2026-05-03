import { useEffect, useMemo, useState } from "react";

// Define the return structure of the pagination hook
type UsePaginationResult<T> = {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  startIndex: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  goToPage: (page: number) => void;
  goNext: () => void;
  goPrevious: () => void;
};

/**
 * Custom React hook for pagination logic.
 *
 * input:
 *   items - full list of items to paginate
 *   itemsPerPage - number of items displayed per page
 *   resetDeps - dependency list that resets page back to 1 when changed
 *
 * output:
 *   currentPage - current active page
 *   totalPages - total number of available pages
 *   paginatedItems - items for current page only
 *   startIndex - starting index of current page in original array
 *   setCurrentPage - direct page setter
 *   goToPage - jump to specific page
 *   goNext - move to next page
 *   goPrevious - move to previous page
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number,
  resetDeps: unknown[] = [],
): UsePaginationResult<T> {
  // Store current active page, default starts from page 1
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page whenever dependencies change
  // Example: search filter, category switch, sorting update
  useEffect(() => {
    setCurrentPage(1);
  }, resetDeps);

  // Calculate total pages (minimum is 1 even if list is empty)
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Prevent current page from exceeding valid range
  const safePage = Math.min(currentPage, totalPages);

  // Calculate start index of current page
  const startIndex = (safePage - 1) * itemsPerPage;

  // Memoized slicing for performance optimization
  // Recalculate only when items/page settings change
  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, startIndex, itemsPerPage]);

  // Jump to a specific page with boundary protection
  function goToPage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  // Move forward one page
  function goNext() {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }

  // Move backward one page
  function goPrevious() {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }

  // Return all pagination state and control functions
  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    startIndex,
    setCurrentPage,
    goToPage,
    goNext,
    goPrevious,
  };
}
