import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { isEmail, required } from '../../utils/validation';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const req = required(email, 'Email address');
    if (req) {
      setError(req);
      return;
    }
    if (!isEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(undefined);
    const res = await requestPasswordReset(email);
    setLoading(false);
    setSubmitted(true);
    setResetToken(res.token);
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">Forgot Password</h2>
        <p className="mt-1 text-sm text-muted">
          Enter your registered email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {submitted ? (
        <div className="mt-6 space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-ink">Reset instructions generated!</p>
          <p className="text-xs text-muted">
            In production, a password reset link is securely dispatched to <span className="font-semibold text-ink">{email}</span>.
          </p>

          {resetToken ? (
            <div className="rounded-xl border border-brand-200 bg-brand-50/80 p-3 text-left dark:border-brand-500/20 dark:bg-brand-500/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Demo Reset Link
              </p>
              <p className="mt-1 text-xs text-muted">
                Since this is a client-side demo without an SMTP email server, follow this link directly:
              </p>
              <Link
                to={`/reset-password?token=${resetToken}`}
                className="mt-2 inline-block rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Proceed to Reset Password &rarr;
              </Link>
            </div>
          ) : (
            <p className="text-xs text-rose-500">
              No demo account found with this email. Try <b>dinesh@vaetotech.com</b> or <b>admin@vaetotech.com</b>.
            </p>
          )}

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail />}
            error={error}
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            rightIcon={<Send className="h-4 w-4" />}
            className="w-full"
          >
            Send Reset Instructions
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
      )}
    </div>
  );
}
