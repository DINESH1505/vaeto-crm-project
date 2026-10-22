import {
  CalendarDays,
  CalendarCheck,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, MenuItem } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useNow } from '../../hooks';
import { formatDate, formatTime, todayISO, toISODate, weekdayName } from '../../utils/date';
import { cn } from '../../utils/helpers';
import type { ThemePreference } from '../../types';

function DatePill() {
  const now = useNow(15000);
  const { meetings, followUps, leads } = useData();
  const navigate = useNavigate();
  const today = todayISO();
  const leadName = (id: string) => leads.find((l) => l.id === id)?.company ?? 'General';
  const agenda = [
    ...meetings.filter((m) => m.date === today && m.status === 'Scheduled').map((m) => ({ id: m.id, time: m.time, title: m.title, sub: leadName(m.leadId), kind: 'Meeting' })),
    ...followUps.filter((f) => f.date === today && f.status === 'Pending').map((f) => ({ id: f.id, time: f.time, title: f.title, sub: leadName(f.leadId), kind: 'Follow-up' })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Dropdown
      panelClassName="w-80"
      trigger={({ toggle, open }) => (
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-label="Today's agenda"
          className="flex items-center gap-2.5 rounded-xl py-1 px-1.5 transition hover:opacity-85 focus:outline-none"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-bold text-ink">{formatDate(toISODate(now), 'DD MMM YYYY')}</span>
            <span className="block text-[11px] text-muted">
              {weekdayName(now)}, {formatTime(`${now.getHours()}:${now.getMinutes()}`)}
            </span>
          </span>
          <ChevronDown className={cn('h-4 w-4 text-muted transition-transform duration-200', open && 'rotate-180')} />
        </button>
      )}
    >
      {(close) => (
        <div>
          <p className="px-3 pb-2 pt-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Today's agenda</p>
          {agenda.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">Nothing scheduled for today.</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {agenda.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-lg px-3 py-2">
                  <span className="mt-0.5 w-16 shrink-0 text-xs font-semibold text-brand-600 dark:text-brand-300">{formatTime(a.time)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{a.title}</span>
                    <span className="block truncate text-xs text-muted">
                      {a.kind} · {a.sub}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-1 border-t border-line pt-1">
            <MenuItem icon={<CalendarDays />} onClick={() => { close(); navigate('/calendar'); }}>
              Open calendar
            </MenuItem>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

function ThemeMenu() {
  const { theme, resolved, setTheme } = useTheme();
  const options: { value: ThemePreference; label: string; icon: JSX.Element }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  ];
  return (
    <Dropdown
      panelClassName="w-44"
      trigger={({ toggle, open }) => (
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-label="Change theme"
          className="flex items-center gap-2 rounded-xl py-1 px-1.5 text-ink transition hover:opacity-85 focus:outline-none"
        >
          {resolved === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="h-4 w-px bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
          <ChevronDown className={cn('h-4 w-4 text-muted transition-transform duration-200', open && 'rotate-180')} />
        </button>
      )}
    >
      {(close) =>
        options.map((o) => (
          <MenuItem key={o.value} icon={o.icon} active={theme === o.value} onClick={() => { setTheme(o.value); close(); }}>
            {o.label}
          </MenuItem>
        ))
      }
    </Dropdown>
  );
}

function ProfileMenu() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const go = (path: string, close: () => void) => {
    close();
    navigate(path);
  };
  return (
    <Dropdown
      panelClassName="w-60"
      trigger={({ toggle, open }) => (
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-label="Open profile menu"
          className="flex items-center gap-2.5 rounded-xl py-1 px-1.5 transition hover:opacity-85 focus:outline-none"
        >
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-pink-500 font-bold text-white text-xs sm:text-sm shadow-sm">
            U
          </span>
          <span className="hidden text-sm font-bold text-ink sm:block">User</span>
          <ChevronDown className={cn('h-4 w-4 text-muted transition-transform duration-200', open && 'rotate-180')} />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="mb-1 border-b border-line px-3 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300">{role?.name}</p>
          </div>
          <MenuItem icon={<UserRound />} onClick={() => go('/profile', close)}>My Profile</MenuItem>
          <MenuItem icon={<KeyRound />} onClick={() => go('/change-password', close)}>Change Password</MenuItem>
          <MenuItem icon={<CalendarCheck />} onClick={() => go('/follow-ups', close)}>My Follow-ups</MenuItem>
          <MenuItem icon={<Settings />} onClick={() => go('/settings', close)}>Settings</MenuItem>
          <div className="mt-1 border-t border-line pt-1">
            <MenuItem icon={<LogOut />} danger onClick={() => { close(); logout('You have been signed out.'); }}>
              Logout
            </MenuItem>
          </div>
        </>
      )}
    </Dropdown>
  );
}

export function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-canvas/85 px-4 pb-3 pt-4 backdrop-blur-md sm:px-6 lg:px-7">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line/80 bg-surface text-ink shadow-card lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <DatePill />
          <ThemeMenu />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
