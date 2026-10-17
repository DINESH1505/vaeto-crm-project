import type { ReactNode } from 'react';
import type { LeadStatus, Priority } from '../../types';
import { avatarGradient, cn, initials } from '../../utils/helpers';

const STATUS_STYLES: Record<LeadStatus, string> = {
  Scheduled: 'bg-blue-50 text-blue-600 ring-blue-200/70 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20',
  Completed: 'bg-emerald-50 text-emerald-600 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20',
  Pending: 'bg-indigo-50 text-indigo-600 ring-indigo-200/70 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/20',
  Lost: 'bg-rose-50 text-rose-500 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20',
  'In Progress': 'bg-amber-50 text-amber-600 ring-amber-200/70 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20',
};

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

type Tone = 'gray' | 'brand' | 'green' | 'amber' | 'red' | 'blue';
const TONES: Record<Tone, string> = {
  gray: 'bg-soft text-muted',
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
};

export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold', TONES[tone], className)}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone: Tone = priority === 'High' ? 'red' : priority === 'Medium' ? 'amber' : 'gray';
  return <Badge tone={tone}>{priority}</Badge>;
}

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Show only the first letter (used for company avatars in tables). */
  single?: boolean;
}

export function Avatar({ name, size = 'md', className, single }: AvatarProps) {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };
  const label = single ? (name.trim()[0] ?? '?').toUpperCase() : initials(name) || '?';
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm',
        avatarGradient(name),
        sizes[size],
        className,
      )}
    >
      {label}
    </span>
  );
}
