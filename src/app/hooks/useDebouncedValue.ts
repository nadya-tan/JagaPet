import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300): T {
  // Store the debounced version of the input value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Create a timer that will update the debounced value after the specified delay
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function:
    // If value or delay changes before the timer completes,
    // clear the previous timeout to avoid stale updates
    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  // Return the debounced value instead of the raw input value
  return debouncedValue;
}
