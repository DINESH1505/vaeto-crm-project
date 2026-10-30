/**
 * DEMO DATA. Generated relative to the date the app is first opened so the dashboard always looks
 * current. All names, emails and phone numbers are fictional.
 */
import type {
  AppNotification,
  FollowUp,
  Lead,
  Meeting,
  Role,
  SystemSettings,
  Task,
  User,
  UserPreferences,
} from '../types';
import { addDays, toISODate } from '../utils/date';

export const SEED_VERSION = 8;

export const DEMO_ACCOUNTS = [
  { label: 'User', email: 'user@vaetotech.com', password: 'Demo@123' },
  { label: 'Admin', email: 'admin@vaetotech.com', password: 'Admin@123' },
] as const;

const isoDateTime = (dayOffset: number, hour = 10, minute = 0) => {
  const d = addDays(new Date(), dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const ALL_PERMISSIONS: { key: Role['permissions'][number]; label: string; group: string; description: string }[] = [
  { key: 'leads.view', label: 'View leads', group: 'Leads', description: 'See lead lists, details and dashboard data' },
  { key: 'leads.create', label: 'Create leads', group: 'Leads', description: 'Add new leads to the pipeline' },
  { key: 'leads.edit', label: 'Edit leads', group: 'Leads', description: 'Update lead details, status and follow-ups' },
  { key: 'leads.delete', label: 'Delete leads', group: 'Leads', description: 'Permanently remove leads' },
  { key: 'leads.export', label: 'Export leads', group: 'Leads', description: 'Download lead data as CSV' },
  { key: 'reports.view', label: 'View reports', group: 'Insights', description: 'Access analytics and reports' },
  { key: 'users.manage', label: 'Manage users', group: 'Administration', description: 'Create, edit and deactivate users' },
  { key: 'roles.manage', label: 'Manage roles', group: 'Administration', description: 'Edit roles and permissions' },
  { key: 'settings.manage', label: 'System settings', group: 'Administration', description: 'Change organisation-wide settings' },
];

export function seedRoles(): Role[] {
  return [
    {
      id: 'role_admin',
      name: 'Administrator',
      description: 'Full access to every feature, including administration.',
      permissions: ALL_PERMISSIONS.map((p) => p.key),
      system: true,
      isAdmin: true,
    },
    {
      id: 'role_manager',
      name: 'Sales Manager',
      description: 'Manages the pipeline and can delete leads, without admin access.',
      permissions: ['leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.export', 'reports.view'],
      system: false,
      isAdmin: false,
    },
    {
      id: 'role_user',
      name: 'User',
      description: 'Standard sales user. Can create and update leads.',
      permissions: ['leads.view', 'leads.create', 'leads.edit', 'leads.export', 'reports.view'],
      system: true,
      isAdmin: false,
    },
  ];
}

export function seedUsers(): User[] {
  const created = isoDateTime(-120);
  return [
    {
      id: 'u_admin',
      name: 'Admin',
      email: 'admin@vaetotech.com',
      password: 'Admin@123',
      roleId: 'role_admin',
      status: 'Active',
      phone: '+91 98400 11223',
      jobTitle: 'System Administrator',
      department: 'Operations',
      location: 'Chennai, India',
      bio: 'Keeps the Vaeto CRM running smoothly for the sales team.',
      createdAt: created,
      lastLogin: isoDateTime(-1, 18, 5),
    },
    {
      id: 'u_user',
      name: 'User',
      email: 'user@vaetotech.com',
      password: 'Demo@123',
      roleId: 'role_user',
      status: 'Active',
      phone: '+91 98765 40020',
      jobTitle: 'Sales Executive',
      department: 'Sales',
      location: 'Chennai, India',
      bio: 'Vaeto CRM sales team member.',
      createdAt: created,
      lastLogin: isoDateTime(-1, 9, 40),
    },
    {
      id: 'u_dinesh',
      name: 'Dinesh E',
      email: 'dinesh@vaetotech.com',
      password: 'Demo@123',
      roleId: 'role_user',
      status: 'Active',
      phone: '+91 98765 40021',
      jobTitle: 'Business Development Executive',
      department: 'Sales',
      location: 'Chennai, India',
      bio: 'Focused on enterprise SaaS accounts in South India.',
      createdAt: created,
      lastLogin: isoDateTime(-1, 9, 40),
    },
    {
      id: 'u_karthik',
      name: 'Karthik M',
      email: 'karthik@vaetotech.com',
      password: 'Demo@123',
      roleId: 'role_manager',
      status: 'Active',
      phone: '+91 99620 55410',
      jobTitle: 'Sales Manager',
      department: 'Sales',
      location: 'Bengaluru, India',
      bio: '',
      createdAt: isoDateTime(-90),
      lastLogin: isoDateTime(-2, 11, 15),
    },
    {
      id: 'u_meera',
      name: 'Meera N',
      email: 'meera@vaetotech.com',
      password: 'Demo@123',
      roleId: 'role_user',
      status: 'Active',
      phone: '+91 90030 77881',
      jobTitle: 'Account Executive',
      department: 'Sales',
      location: 'Hyderabad, India',
      bio: '',
      createdAt: isoDateTime(-60),
      lastLogin: isoDateTime(-3, 16, 30),
    },
    {
      id: 'u_rohan',
      name: 'Rohan S',
      email: 'rohan@vaetotech.com',
      password: 'Demo@123',
      roleId: 'role_user',
      status: 'Inactive',
      phone: '+91 97890 12034',
      jobTitle: 'Sales Intern',
      department: 'Sales',
      location: 'Pune, India',
      bio: '',
      createdAt: isoDateTime(-45),
      lastLogin: isoDateTime(-30, 10, 0),
    },
  ];
}

export function seedLeads(): Lead[] {
  return [];
}

export function seedFollowUps(): FollowUp[] {
  return [];
}

export function seedMeetings(): Meeting[] {
  return [];
}

export function seedTasks(): Task[] {
  return [];
}

export function seedNotifications(): AppNotification[] {
  return [
    { id: 'nt_01', type: 'system', title: 'Welcome to Vaeto CRM', message: 'Ready to import your real business leads.', link: '/leads', read: true, createdAt: isoDateTime(0, 8, 0), userId: 'all' },
  ];
}

export function seedSettings(): SystemSettings {
  return {
    companyName: 'VaetoTech',
    supportEmail: 'admin@vaetotech.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD MMM YYYY',
    pageSize: 9,
    leadSources: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Email Campaign'],
    industries: [
      'IT Services', 'Software', 'Consulting', 'Manufacturing', 'Retail', 'Healthcare', 'Education',
      'Construction', 'Logistics', 'Media', 'FMCG', 'Finance', 'Agriculture', 'Real Estate', 'Automotive', 'Telecom',
    ],
    sessionTimeoutMins: 60,
    allowUserExport: true,
    maintenanceBanner: '',
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  inAppNotifications: true,
  emailNotifications: false,
  followUpReminders: true,
  weeklySummary: false,
  showFollowUpPanel: true,
  compactTables: false,
  defaultLeadView: 'all',
};

export const seedDateStamp = () => toISODate(new Date());
