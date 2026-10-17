import { useCallback, useEffect, useRef, useState } from 'react';
import { readStore, writeStore } from '../utils/storage';

/** useState that persists to localStorage under the `vaeto.` namespace. */
export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
    return readStore<T>(key, fallback);
  });

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      // Ensure the initial (seed) value is written once.
      writeStore(key, value);
      return;
    }
    writeStore(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useClickOutside<T extends HTMLElement>(onOutside: () => void, active = true) {
  const ref = useRef<T>(null);
  const handler = useRef(onOutside);
  handler.current = onOutside;

  useEffect(() => {
    if (!active) return;
    const listener = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler.current();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('keydown', onKey);
    };
  }, [active]);

  return ref;
}

/** Ticking clock, updates every `interval` ms. */
export function useNow(interval = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

/** Simulated async action with loading state; used where a real API call would go. */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const run = useCallback(async <R,>(fn: () => Promise<R> | R): Promise<R> => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);
  return { loading, run };
}
