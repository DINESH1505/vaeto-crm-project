import { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { passwordStrength, validatePassword } from '../../utils/validation';

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const toast = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = passwordStrength(next);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) {
      setError('Current password is required');
      return;
    }
    const valErr = validatePassword(next);
    if (valErr) {
      setError(valErr);
      return;
    }
    if (next !== confirm) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await changePassword(current, next);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    toast.success('Your password has been changed');
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
          Change Password
        </h1>
        <p className="text-xs text-muted">Update your login security credentials.</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </div>
          )}

          <Input
            label="Current Password"
            type={show ? 'text' : 'password'}
            placeholder="Enter current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            leftIcon={<Lock />}
            required
          />

          <Input
            label="New Password"
            type={show ? 'text' : 'password'}
            placeholder="Enter new password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            leftIcon={<Lock />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="p-1 text-muted hover:text-ink focus:outline-none"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />

          {next && (
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
            </div>
          )}

          <Input
            label="Confirm New Password"
            type={show ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            leftIcon={<Lock />}
            required
          />

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
