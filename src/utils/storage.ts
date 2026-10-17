/** Namespaced, fault-tolerant localStorage helpers. */
const PREFIX = 'vaeto.';

export function readStore<T>(key: string, fallback: T, storage: Storage = localStorage): T {
  try {
    const raw = storage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T, storage: Storage = localStorage) {
  try {
    storage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable; the app keeps working in memory.
  }
}

export function removeStore(key: string, storage: Storage = localStorage) {
  try {
    storage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export const STORE_KEYS = {
  leads: 'leads',
  followUps: 'followUps',
  meetings: 'meetings',
  tasks: 'tasks',
  notifications: 'notifications',
  users: 'users',
  roles: 'roles',
  settings: 'settings',
  session: 'session',
  theme: 'theme',
  preferences: 'preferences',
  resetTokens: 'resetTokens',
  seeded: 'seededVersion',
} as const;
