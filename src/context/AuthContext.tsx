/**
 * DEMO AUTHENTICATION. Not secure.
 * Credentials are checked against demo users in localStorage. This is only so the UI can be explored.
 * Real authentication must be done by a backend (hashed passwords, HTTP-only session cookies or
 * short-lived tokens, server-side permission checks). Replace `login`, `requestPasswordReset`,
 * `resetPassword` and `changePassword` with API calls when a backend is available.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Permission, Role, SessionUser } from '../types';
import { useData } from './DataContext';
import { useToast } from './ToastContext';
import { STORE_KEYS, readStore, removeStore, writeStore } from '../utils/storage';
import { sleep, uid } from '../utils/helpers';
import { validatePassword } from '../utils/validation';

interface Session {
  userId: string;
  remember: boolean;
  lastActive: number;
}

type Result = { ok: true } | { ok: false; error: string };

interface AuthApi {
  user: SessionUser | null;
  role: Role | null;
  isAdmin: boolean;
  can: (p: Permission) => boolean;
  login: (email: string, password: string, remember: boolean) => Promise<Result>;
  logout: (reason?: string) => void;
  requestPasswordReset: (email: string) => Promise<{ token: string | null }>;
  verifyResetToken: (token: string) => string | null;
  resetPassword: (token: string, password: string) => Promise<Result>;
  changePassword: (current: string, next: string) => Promise<Result>;
}

const AuthContext = createContext<AuthApi | null>(null);

function loadSession(): Session | null {
  return readStore<Session | null>(STORE_KEYS.session, null) ?? readStore<Session | null>(STORE_KEYS.session, null, sessionStorage);
}

function saveSession(s: Session) {
  writeStore(STORE_KEYS.session, s, s.remember ? localStorage : sessionStorage);
}

function clearSession() {
  removeStore(STORE_KEYS.session);
  removeStore(STORE_KEYS.session, sessionStorage);
}

type ResetTokens = Record<string, { email: string; expires: number }>;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users, roles, settings, updateUser, setActor } = useData();
  const toast = useToast();
  const [session, setSession] = useState<Session | null>(() => {
    const s = loadSession();
    if (!s) return null;
    // Expire non-remembered sessions that have been idle past the timeout.
    const timeoutMs = readStore<{ sessionTimeoutMins?: number }>(STORE_KEYS.settings, {}).sessionTimeoutMins ?? 60;
    if (!s.remember && Date.now() - s.lastActive > timeoutMs * 60000) {
      clearSession();
      return null;
    }
    return s;
  });

  const fullUser = session ? users.find((u) => u.id === session.userId && u.status === 'Active') : undefined;
  const user: SessionUser | null = useMemo(() => {
    if (!fullUser) return null;
    const { password: _pw, ...rest } = fullUser;
    return rest;
  }, [fullUser]);
  const role = user ? roles.find((r) => r.id === user.roleId) ?? null : null;
  const isAdmin = !!role?.isAdmin;

  useEffect(() => setActor(user), [user, setActor]);

  // Session was invalidated (user deleted or deactivated).
  useEffect(() => {
    if (session && !fullUser) {
      clearSession();
      setSession(null);
    }
  }, [session, fullUser]);

  const logout = useCallback(
    (reason?: string) => {
      clearSession();
      setSession(null);
      if (reason) toast.info(reason);
    },
    [toast],
  );

  // Inactivity timeout (only for sessions without "remember me").
  const lastActive = useRef(Date.now());
  useEffect(() => {
    if (!session || session.remember) return;
    const bump = () => {
      const now = Date.now();
      if (now - lastActive.current > 15000) {
        lastActive.current = now;
        saveSession({ ...session, lastActive: now });
      }
    };
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const timer = setInterval(() => {
      if (Date.now() - lastActive.current > settings.sessionTimeoutMins * 60000) {
        logout('Your session expired due to inactivity.');
      }
    }, 30000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(timer);
    };
  }, [session, settings.sessionTimeoutMins, logout]);

  const login: AuthApi['login'] = async (email, password, remember) => {
    await sleep(700); // simulate network latency
    const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match || match.password !== password) {
      return { ok: false, error: 'Invalid email or password. Please try again.' };
    }
    if (match.status !== 'Active') {
      return { ok: false, error: 'Your account is inactive. Please contact your administrator.' };
    }
    const s: Session = { userId: match.id, remember, lastActive: Date.now() };
    clearSession();
    saveSession(s);
    lastActive.current = Date.now();
    updateUser(match.id, { lastLogin: new Date().toISOString() });
    setSession(s);
    return { ok: true };
  };

  const requestPasswordReset: AuthApi['requestPasswordReset'] = async (email) => {
    await sleep(800);
    const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) return { token: null };
    const token = uid('reset');
    const tokens = readStore<ResetTokens>(STORE_KEYS.resetTokens, {});
    tokens[token] = { email: match.email, expires: Date.now() + 30 * 60000 };
    writeStore(STORE_KEYS.resetTokens, tokens);
    return { token };
  };

  const verifyResetToken: AuthApi['verifyResetToken'] = (token) => {
    const entry = readStore<ResetTokens>(STORE_KEYS.resetTokens, {})[token];
    if (!entry || entry.expires < Date.now()) return null;
    return entry.email;
  };

  const resetPassword: AuthApi['resetPassword'] = async (token, password) => {
    await sleep(700);
    const email = verifyResetToken(token);
    if (!email) return { ok: false, error: 'This reset link is invalid or has expired. Please request a new one.' };
    const pwError = validatePassword(password);
    if (pwError) return { ok: false, error: pwError };
    const match = users.find((u) => u.email === email);
    if (!match) return { ok: false, error: 'Account not found.' };
    updateUser(match.id, { password });
    const tokens = readStore<ResetTokens>(STORE_KEYS.resetTokens, {});
    delete tokens[token];
    writeStore(STORE_KEYS.resetTokens, tokens);
    return { ok: true };
  };

  const changePassword: AuthApi['changePassword'] = async (current, next) => {
    await sleep(600);
    if (!fullUser) return { ok: false, error: 'You are not signed in.' };
    if (fullUser.password !== current) return { ok: false, error: 'Current password is incorrect.' };
    if (current === next) return { ok: false, error: 'New password must be different from the current password.' };
    const pwError = validatePassword(next);
    if (pwError) return { ok: false, error: pwError };
    updateUser(fullUser.id, { password: next });
    return { ok: true };
  };

  const can = useCallback((p: Permission) => !!role?.permissions.includes(p), [role]);

  return (
    <AuthContext.Provider
      value={{ user, role, isAdmin, can, login, logout, requestPasswordReset, verifyResetToken, resetPassword, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
