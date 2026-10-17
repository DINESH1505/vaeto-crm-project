import {
  BarChart3,
  Bell,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  CheckSquare,
  Home,
  KeyRound,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '../types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: Permission;
  /** Match nested paths (e.g. /leads/123) as active. */
  matchPrefix?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
  { title: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: Home }] },
  {
    title: 'Workspace',
    items: [
      { label: 'My Tasks', to: '/tasks', icon: CheckSquare },
      { label: 'Reports', to: '/reports', icon: BarChart3, permission: 'reports.view' },
      { label: 'Calendar', to: '/calendar', icon: CalendarDays },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
  {
    title: 'Leads',
    items: [
      { label: 'Manage Your Lead', to: '/leads', icon: Users, matchPrefix: true },
      { label: 'Follow-ups', to: '/follow-ups', icon: CalendarCheck },
      { label: 'Schedule Meeting', to: '/meetings/new', icon: CalendarPlus },
    ],
  },
  {
    title: 'Administration',
    adminOnly: true,
    items: [
      { label: 'User Management', to: '/admin/users', icon: UserCog },
      { label: 'Roles & Permissions', to: '/admin/roles', icon: ShieldCheck },
      { label: 'System Settings', to: '/admin/settings', icon: SlidersHorizontal },
    ],
  },
];

export const ACCOUNT_LINKS = [
  { label: 'My Profile', to: '/profile', icon: UserCog },
  { label: 'Change Password', to: '/change-password', icon: KeyRound },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings },
];
