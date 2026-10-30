import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { PageLoader } from '../components/ui';
import { useData } from '../context/DataContext';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useData();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Subtle, soft light ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 bottom-[-180px] h-[450px] w-[450px] rounded-full bg-violet-100/35 blur-3xl dark:bg-brand-900/10" />
        <div className="absolute right-[-120px] top-[-120px] h-[400px] w-[400px] rounded-full bg-indigo-100/35 blur-3xl dark:bg-indigo-900/10" />
      </div>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="relative lg:pl-[248px]">
        <Header onMenu={() => setMobileOpen(true)} />
        {settings.maintenanceBanner && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 sm:mx-6 lg:mx-7 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
            <Megaphone className="h-4 w-4 shrink-0" />
            {settings.maintenanceBanner}
          </div>
        )}
        <main className="px-4 pb-10 pt-5 sm:px-6 sm:pt-6 lg:px-7">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
