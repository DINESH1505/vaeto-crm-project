import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isEmail, required } from '../../utils/validation';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('user@vaetotech.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const remember = true;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    const eReq = required(email, 'Email address');
    if (eReq) next.email = eReq;
    else if (!isEmail(email)) next.email = 'Please enter a valid email address';

    const pReq = required(password, 'Password');
    if (pReq) next.password = pReq;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    const res = await login(email, password, remember);
    setLoading(false);
    if (!res.ok) {
      setErrors({ form: res.error });
      return;
    }
    toast.success('Signed in successfully');
    const dest = (location.state as { from?: string })?.from || '/dashboard';
    navigate(dest, { replace: true });
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[30px] font-black tracking-tight text-[#0f172a] dark:text-white">
          Welcome Back!
        </h2>
        <p className="mt-1.5 text-[13.5px] text-[#64748b] dark:text-gray-400">
          Sign in to your Lead Management Dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {errors.form && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-semibold text-rose-600 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 animate-slide-up">
            {errors.form}
          </div>
        )}

        {/* Email input with icon */}
        <div className="group relative">
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="text-[#94a3b8] transition-colors group-focus-within:text-[#7c3aed]" strokeWidth={2} />}
            error={errors.email}
            autoComplete="email"
            className="h-12 rounded-xl border-[#e2e8f0] bg-white text-sm placeholder:text-[#94a3b8] transition-all duration-200 focus:bg-white focus:border-[#7c3aed] focus:ring-4 focus:ring-purple-500/15"
          />
        </div>

        {/* Password input with lock and eye toggle */}
        <div className="group relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="text-[#94a3b8] transition-colors group-focus-within:text-[#7c3aed]" strokeWidth={2} />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="p-1.5 text-[#94a3b8] hover:text-[#0f172a] focus:outline-none transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password}
            autoComplete="current-password"
            className="h-12 rounded-xl border-[#e2e8f0] bg-white text-sm placeholder:text-[#94a3b8] transition-all duration-200 focus:bg-white focus:border-[#7c3aed] focus:ring-4 focus:ring-purple-500/15"
          />
        </div>

        {/* High-end gradient login button matching reference */}
        <button
          type="submit"
          disabled={loading}
          className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#3b82f6] text-sm font-bold text-white shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          <span className="relative z-10">{loading ? 'Signing in...' : 'Login'}</span>
          {!loading && <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />}
        </button>
      </form>
    </div>
  );
}
