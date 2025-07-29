// file: src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value. This is useful for delaying an action
 * (like an API call) until the user has stopped typing.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds. A value around 500ms is recommended for a good user experience.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value or delay changes before the timer fires
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}