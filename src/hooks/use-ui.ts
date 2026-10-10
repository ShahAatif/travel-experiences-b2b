"use client";

import { useState, useCallback, useEffect } from 'react';

export function useToggle(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

export function useFocus(targetRef: HTMLInputElement | null) {
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    const handleFocus = () => setHasFocus(true);
    const handleBlur = () => setHasFocus(false);

    if (targetRef) {
      targetRef.addEventListener('focus', handleFocus);
      targetRef.addEventListener('blur', handleBlur);

      return () => {
        targetRef.removeEventListener('focus', handleFocus);
        targetRef.removeEventListener('blur', handleBlur);
      };
    }
  }, [targetRef]);

  return hasFocus;
}

export function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener?.('change', listener);

    return () => mql.removeEventListener?.('change', listener);
  }, [query]);

  return matches;
}