export type Errors<T> = Partial<Record<keyof T, string>>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[0-9\s-]{7,16}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isPhone(value: string): boolean {
  return PHONE_RE.test(value.trim());
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
