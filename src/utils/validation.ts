import { isValidPhoneNumber, parsePhoneNumber, type CountryCode } from 'libphonenumber-js';

export type Errors<T> = Partial<Record<keyof T, string>>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/**
 * Validates international phone numbers using Google's libphonenumber.
 * Validates number lengths and country-specific numbering rules without simple fixed-length regex.
 */
export function isPhone(value: string | undefined | null, defaultCountry: CountryCode = 'IN'): boolean {
  if (!value || !value.trim()) return false;
  const trimmed = value.trim();
  // Reject alphabetic characters and unsupported special characters
  if (/[a-zA-Z]/.test(trimmed)) return false;
  try {
    return isValidPhoneNumber(trimmed, defaultCountry);
  } catch {
    return false;
  }
}

/**
 * Normalizes a phone number to standard E.164 format (e.g., +919876543210).
 */
export function normalizePhone(value: string | undefined | null, defaultCountry: CountryCode = 'IN'): string {
  if (!value || !value.trim()) return '';
  const trimmed = value.trim();
  try {
    const parsed = parsePhoneNumber(trimmed, defaultCountry);
    if (parsed && parsed.isValid()) {
      return parsed.number; // E.164 format
    }
  } catch {}
  return trimmed;
}

export function required(value: string | undefined | null, label: string): string | undefined {
  return value && String(value).trim() ? undefined : `${label} is required`;
}

export interface PasswordCheck {
  label: string;
  ok: boolean;
}

export function passwordChecks(pw: string): PasswordCheck[] {
  return [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(pw) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(pw) },
    { label: 'One number', ok: /\d/.test(pw) },
    { label: 'One special character', ok: /[^A-Za-z0-9]/.test(pw) },
  ];
}

export function passwordStrength(pw: string): { score: number; label: string; color: string } {
  const score = passwordChecks(pw).filter((c) => c.ok).length;
  if (!pw) return { score: 0, label: '', color: 'bg-line' };
  if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

export function validatePassword(pw: string): string | undefined {
  if (!pw) return 'Password is required';
  const failed = passwordChecks(pw).find((c) => !c.ok);
  return failed ? `Password needs: ${failed.label.toLowerCase()}` : undefined;
}

export function hasErrors<T>(errors: Errors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
