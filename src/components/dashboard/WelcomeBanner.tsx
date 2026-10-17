import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { greeting } from '../../utils/date';

export function WelcomeBanner() {
  const { user, isAdmin } = useAuth();
  const displayName = isAdmin ? 'Admin' : (user?.name || 'User');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100/70 bg-gradient-to-r from-violet-50/80 via-white to-indigo-50/60 p-5 shadow-card sm:p-6 dark:border-brand-500/20 dark:from-brand-900/30 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-navy dark:text-white sm:text-2xl">
              {greeting()}, {displayName}! 👋
            </h1>
            <p className="mt-0.5 text-xs font-medium text-muted sm:text-sm">
              Here&apos;s what&apos;s happening with your leads today.
            </p>
          </div>
        </div>

        {/* 3D-styled chart badge illustration recreating the reference icon */}
        <div className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-white/60 bg-white/70 px-4 py-2 shadow-sm backdrop-blur md:flex dark:border-white/10 dark:bg-white/5">
          <div className="flex items-end gap-1 h-7">
            <span className="w-2 rounded-t bg-brand-300 h-3" />
            <span className="w-2 rounded-t bg-brand-400 h-5" />
            <span className="w-2 rounded-t bg-brand-600 h-7" />
          </div>
          <span className="ml-2 text-xs font-bold text-brand-700 dark:text-brand-300">
            Pipeline Active
          </span>
        </div>
      </div>
    </div>
  );
}
