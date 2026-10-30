export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Meeting Scheduled'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Scheduled'
  | 'Completed'
  | 'Pending'
  | 'In Progress';

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
  'Scheduled',
  'In Progress',
  'Completed',
  'Pending',
];

export type Priority = 'Low' | 'Medium' | 'High';

export interface ActivityEntry {
  id: string;
  type: 'created' | 'updated' | 'status' | 'note' | 'meeting' | 'follow-up';
  message: string;
  at: string; // ISO datetime
  by: string; // user display name
}

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  title?: string;
  email: string;
  phone: string;
  corporatePhone?: string;
  whatsappNumber?: string;
  countryCode?: string;
  status: LeadStatus;
  completedOn?: string;
  /** Date of the most recent / planned meeting (yyyy-mm-dd). */
  meetingDate: string;
  /** Meeting time (HH:mm). */
  meetingTime: string;
  /** Date of last contact (yyyy-mm-dd). Empty when never contacted. */
  lastContact: string;
  nextFollowUpDate?: string;
  comments: string;
  source: string;
  industry: string;
  dealValue: number;
  priority: Priority;
  ownerId: string;
  address: string;
  website: string;
  createdAt: string;
  updatedAt: string;
  activity: ActivityEntry[];
}

export type FollowUpType = 'Call' | 'Email' | 'Meeting' | 'Demo' | 'WhatsApp';
export type FollowUpStatus = 'Pending' | 'Done' | 'Cancelled';

export interface FollowUp {
  id: string;
  leadId: string;
  title: string;
  type: FollowUpType;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  notes: string;
  status: FollowUpStatus;
  ownerId: string;
  createdAt: string;
}

export type MeetingMode = 'Online' | 'In Person' | 'Phone';
export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Meeting {
  id: string;
  leadId: string;
  title: string;
  date: string;
  time: string;
  durationMins: number;
  mode: MeetingMode;
  location: string;
  attendees: string;
  notes: string;
  status: MeetingStatus;
  ownerId: string;
  createdAt: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  leadId: string;
  assigneeId: string;
  createdAt: string;
}

export type NotificationType = 'lead' | 'follow-up' | 'meeting' | 'task' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  /** Recipient user id, or 'all'. */
  userId: string;
}

export type Permission =
  | 'leads.view'
  | 'leads.create'
  | 'leads.edit'
  | 'leads.delete'
  | 'leads.export'
  | 'reports.view'
  | 'users.manage'
  | 'roles.manage'
  | 'settings.manage';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  /** System roles cannot be deleted. */
  system: boolean;
  /** Grants access to the administration area. */
  isAdmin: boolean;
}

export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  /** DEMO ONLY: stored in plain text in localStorage. Never do this with a real backend. */
  password: string;
  roleId: string;
  status: UserStatus;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  bio: string;
  createdAt: string;
  lastLogin: string;
}

export type SessionUser = Omit<User, 'password'>;

export interface SystemSettings {
  companyName: string;
  supportEmail: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  timezone: string;
  dateFormat: 'DD MMM YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  pageSize: number;
  leadSources: string[];
  industries: string[];
  sessionTimeoutMins: number;
  allowUserExport: boolean;
  maintenanceBanner: string;
}

export interface UserPreferences {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  followUpReminders: boolean;
  weeklySummary: boolean;
  showFollowUpPanel: boolean;
  compactTables: boolean;
  defaultLeadView: 'all' | 'mine';
}

export type ThemePreference = 'light' | 'dark' | 'system';
