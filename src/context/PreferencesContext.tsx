import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserPreferences } from '../types';
import { DEFAULT_PREFERENCES } from '../data/sampleData';
import { readStore, writeStore } from '../utils/storage';
import { useAuth } from './AuthContext';

interface PrefsApi {
  prefs: UserPreferences;
  setPrefs: (patch: Partial<UserPreferences>) => void;
}

const PreferencesContext = createContext<PrefsApi | null>(null);

/** Per-user UI preferences, persisted in localStorage. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `preferences.${user?.id ?? 'guest'}`;
  const [prefs, setState] = useState<UserPreferences>(() => ({ ...DEFAULT_PREFERENCES, ...readStore(key, {}) }));

  useEffect(() => {
    setState({ ...DEFAULT_PREFERENCES, ...readStore(key, {}) });
  }, [key]);

  const setPrefs = (patch: Partial<UserPreferences>) =>
    setState((p) => {
      const next = { ...p, ...patch };
      writeStore(key, next);
      return next;
    });

  return <PreferencesContext.Provider value={{ prefs, setPrefs }}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
