import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { passwordChecks, passwordStrength, validatePassword } from '../../utils/validation';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { verifyResetToken, resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const accountEmail = token ? verifyResetToken(token) : null;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = passwordChecks(password);
  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await resetPassword(token, password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    toast.success('Password updated successfully! Please login with your new credentials.');
    navigate('/login', { replace: true });
  };

  if (!token || !accountEmail) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">Invalid Reset Link</h2>
        <p className="mt-2 text-sm text-muted">
          This password reset token has expired or is invalid. Please request a new one.
        </p>
        <div className="mt-6">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">Reset Password</h2>
        <p className="mt-1 text-sm text-muted">
          Create a new secure password for <span className="font-semibold text-ink">{accountEmail}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="p-1 text-muted hover:text-ink focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          autoComplete="new-password"
        />

        {password && (
          <div className="rounded-xl border border-line bg-soft/50 p-3 text-xs">
            <div className="flex items-center justify-between font-medium">
              <span>Password strength:</span>
              <span className="font-bold">{strength.label}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-1">
                  <CheckCircle2 className={`h-3 w-3 ${c.ok ? 'text-emerald-500' : 'text-muted/40'}`} />
                  <span className={c.ok ? 'text-ink' : ''}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock />}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          rightIcon={<ShieldCheck className="h-4 w-4" />}
          className="w-full"
        >
          Update Password
        </Button>

        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
