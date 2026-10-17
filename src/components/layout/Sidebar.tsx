import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { NAV_SECTIONS, type NavItem } from '../../routes/navigation';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function isItemActive(item: NavItem, pathname: string) {
  if (item.to === '/leads') {
    // "Manage Your Lead" is active for /leads and lead detail/edit pages, but not /leads/new
    return pathname === '/leads' || (pathname.startsWith('/leads/') && pathname !== '/leads/new');
  }
  return pathname === item.to || (item.matchPrefix && pathname.startsWith(item.to + '/'));
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { isAdmin, can } = useAuth();
  const { pathname } = useLocation();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <NavLink to="/dashboard" onClick={onClose} aria-label="Go to dashboard">
          <Logo size="md" />
        </NavLink>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-soft lg:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 pb-6 pt-2" aria-label="Main navigation">
        {NAV_SECTIONS.filter((s) => !s.adminOnly || isAdmin).map((section) => {
          const items = section.items.filter((i) => !i.permission || can(i.permission));
          if (!items.length) return null;
          return (
            <div key={section.title}>
              <p className="mb-2 px-2 text-[13px] font-bold text-ink">{section.title}</p>
              <ul className="space-y-1">
                {items.map((item) => {
                  const active = isItemActive(item, pathname);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                          active
                            ? 'bg-gradient-to-r from-brand-500/90 to-brand-400/80 text-white shadow-glow'
                            : 'text-ink/80 hover:bg-soft hover:text-ink',
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className={cn('h-[19px] w-[19px] shrink-0', active ? 'text-white' : 'text-brand-500')} />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line/70 bg-surface lg:block">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-[272px] max-w-[85vw] animate-slide-in-left bg-surface shadow-lift">{content}</aside>
        </div>
      )}
    </>
  );
}
