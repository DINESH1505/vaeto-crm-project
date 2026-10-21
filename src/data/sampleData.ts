/**
 * DEMO DATA. Generated relative to the date the app is first opened so the dashboard always looks
 * current. All names, emails and phone numbers are fictional.
 */
import type {
  AppNotification,
  FollowUp,
  Lead,
  LeadStatus,
  Meeting,
  Priority,
  Role,
  SystemSettings,
  Task,
  User,
  UserPreferences,
} from '../types';
import { addDays, isoOffset, toISODate } from '../utils/date';

export const SEED_VERSION = 4;

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

type LeadSeed = [
  company: string,
  contact: string,
  domain: string,
  phone: string,
  status: LeadStatus,
  meetingOffset: number,
  meetingTime: string,
  lastContactOffset: number | null,
  comments: string,
  source: string,
  industry: string,
  value: number,
  priority: Priority,
  ownerId: string,
  createdOffset: number,
];

const LEAD_SEEDS: LeadSeed[] = [
  ['ABC Technologies', 'Rahul Kumar', 'abctech.com', '+91 98765 43210', 'Scheduled', 0, '10:00', -1, 'Product demo required', 'Website', 'IT Services', 450000, 'High', 'u_dinesh', -2],
  ['XYZ Solutions', 'Priya Sharma', 'xyztech.com', '+91 98764 32109', 'Completed', -1, '11:30', -1, 'Good response', 'Referral', 'Consulting', 320000, 'Medium', 'u_dinesh', -20],
  ['Tech Innovators', 'Arun Raj', 'techinnov.com', '+91 98452 12098', 'In Progress', -2, '14:00', -2, 'Discussed pricing', 'LinkedIn', 'Software', 610000, 'High', 'u_dinesh', -5],
  ['Global Systems', 'Sneha S', 'globalsys.com', '+91 98422 10987', 'Completed', -3, '15:30', -2, 'Closed deal', 'Cold Call', 'Manufacturing', 880000, 'High', 'u_dinesh', -34],
  ['NextGen Software', 'Vikash T', 'nextgensoft.com', '+91 95320 99876', 'Lost', -4, '16:00', -3, 'Budget issue', 'Website', 'Software', 150000, 'Low', 'u_dinesh', -28],
  ['Mega Corp', 'Divya L', 'megacorp.com', '+91 97898 66543', 'Pending', -5, '14:30', null, 'Follow up required', 'Trade Show', 'Retail', 270000, 'Medium', 'u_dinesh', -3],
  ['Future Tech', 'Suresh R', 'futuretech.com', '+91 96099 66543', 'In Progress', -6, '12:00', -5, 'Proposal shared', 'Email Campaign', 'IT Services', 390000, 'Medium', 'u_dinesh', -15],
  ['Sunrise Labs', 'Monica K', 'sunriselabs.com', '+91 95087 66554', 'Lost', -7, '13:00', -6, 'No reply', 'LinkedIn', 'Healthcare', 120000, 'Low', 'u_dinesh', -40],
  ['Bright Minds', 'Anita P', 'brightminds.in', '+91 99401 22871', 'Scheduled', 2, '11:00', -2, 'Proposal follow-up', 'Referral', 'Education', 210000, 'Medium', 'u_dinesh', -1],
  ['Pinnacle Infra', 'Harish V', 'pinnacleinfra.com', '+91 98840 33219', 'Completed', -9, '10:30', -8, 'Signed annual contract', 'Website', 'Construction', 1250000, 'High', 'u_karthik', -52],
  ['BlueOcean Retail', 'Kavya M', 'blueocean.in', '+91 90031 45672', 'Scheduled', 1, '15:00', -3, 'Wants a POC for 3 stores', 'Trade Show', 'Retail', 540000, 'High', 'u_meera', -6],
  ['Nova Healthcare', 'Dr. Ramesh I', 'novahealth.in', '+91 94440 56123', 'In Progress', -3, '17:00', -3, 'Compliance review ongoing', 'Referral', 'Healthcare', 760000, 'High', 'u_karthik', -18],
  ['Zenith Logistics', 'Farhan A', 'zenithlogistics.com', '+91 98410 77231', 'Completed', -12, '11:00', -10, 'Onboarding scheduled', 'Cold Call', 'Logistics', 430000, 'Medium', 'u_dinesh', -45],
  ['Orbit Media', 'Lakshmi R', 'orbitmedia.co', '+91 99520 88112', 'Lost', -14, '16:30', -12, 'Went with competitor', 'Email Campaign', 'Media', 95000, 'Low', 'u_meera', -50],
  ['Crescent Foods', 'Imran K', 'crescentfoods.in', '+91 97100 23456', 'Pending', 0, '', null, 'Awaiting first call', 'Website', 'FMCG', 180000, 'Low', 'u_meera', -1],
  ['Quantum Analytics', 'Neha J', 'quantumanalytics.ai', '+91 98111 90876', 'Scheduled', 3, '12:30', -1, 'Technical deep-dive', 'LinkedIn', 'Software', 920000, 'High', 'u_dinesh', -4],
  ['Silverline Finance', 'Gautam B', 'silverlinefin.com', '+91 99000 34512', 'Completed', -16, '10:00', -15, 'Payment received', 'Referral', 'Finance', 670000, 'High', 'u_karthik', -58],
  ['GreenLeaf Agro', 'Pooja D', 'greenleafagro.in', '+91 96770 11290', 'In Progress', -1, '09:30', -1, 'Negotiating licence count', 'Trade Show', 'Agriculture', 260000, 'Medium', 'u_dinesh', -9],
  ['UrbanNest Realty', 'Siddharth G', 'urbannest.in', '+91 98945 67012', 'Lost', -20, '14:00', -18, 'Project put on hold', 'Cold Call', 'Real Estate', 340000, 'Medium', 'u_dinesh', -55],
  ['Apex Motors', 'Ritu S', 'apexmotors.com', '+91 97910 22345', 'Completed', -8, '15:00', -7, 'Upsell opportunity', 'Website', 'Automotive', 510000, 'Medium', 'u_dinesh', -38],
  ['CloudPeak Systems', 'Manoj P', 'cloudpeak.io', '+91 98400 98765', 'Scheduled', 5, '16:00', -2, 'Security review meeting', 'LinkedIn', 'IT Services', 830000, 'High', 'u_karthik', -7],
  ['Lotus Wellness', 'Deepa H', 'lotuswellness.in', '+91 90250 33456', 'In Progress', -4, '11:30', -4, 'Shared case studies', 'Email Campaign', 'Healthcare', 145000, 'Low', 'u_meera', -12],
  ['Vertex Edu', 'Ajay N', 'vertexedu.com', '+91 99620 77123', 'Completed', -10, '13:30', -9, 'Renewal confirmed', 'Referral', 'Education', 290000, 'Medium', 'u_dinesh', -48],
  ['Horizon Telecom', 'Shalini T', 'horizontel.com', '+91 98840 55678', 'Scheduled', 1, '10:30', -1, 'Pricing discussion', 'Website', 'Telecom', 990000, 'High', 'u_dinesh', -2],
];

function emailFor(contact: string, domain: string) {
  const first = contact.replace(/^Dr\.\s*/, '').split(' ')[0].toLowerCase();
  return `${first}@${domain}`;
}

export function seedLeads(): Lead[] {
  return LEAD_SEEDS.map((s, i) => {
    const [company, contact, domain, phone, status, mOff, mTime, lcOff, comments, source, industry, value, priority, ownerId, cOff] = s;
    const createdAt = isoDateTime(cOff, 9 + (i % 7), (i * 7) % 60);
    return {
      id: `lead_${String(i + 1).padStart(3, '0')}`,
      company,
      contactName: contact,
      email: emailFor(contact, domain),
      phone,
      status,
      meetingDate: mTime ? isoOffset(mOff) : '',
      meetingTime: mTime,
      lastContact: lcOff === null ? '' : isoOffset(lcOff),
      comments,
      source,
      industry,
      dealValue: value,
      priority,
      ownerId,
      address: 'India',
      website: `https://www.${domain}`,
      createdAt,
      updatedAt: createdAt,
      activity: [
        { id: `act_${i}_1`, type: 'created', message: `Lead created from ${source}`, at: createdAt, by: ownerId === 'u_dinesh' ? 'Dinesh E' : 'Admin' },
        ...(lcOff !== null
          ? [{ id: `act_${i}_2`, type: 'note' as const, message: comments, at: isoDateTime(lcOff, 12, 0), by: 'Dinesh E' }]
          : []),
      ],
    };
  });
}

export function seedFollowUps(): FollowUp[] {
  const mk = (
    id: string,
    leadId: string,
    title: string,
    type: FollowUp['type'],
    offset: number,
    time: string,
    status: FollowUp['status'],
    ownerId = 'u_dinesh',
  ): FollowUp => ({
    id,
    leadId,
    title,
    type,
    date: isoOffset(offset),
    time,
    notes: '',
    status,
    ownerId,
    createdAt: isoDateTime(Math.min(offset, 0) - 2),
  });
  return [
    mk('fu_01', 'lead_001', 'Product Demo', 'Demo', 0, '10:00', 'Pending'),
    mk('fu_02', 'lead_003', 'Pricing Discussion', 'Call', 1, '14:00', 'Pending'),
    mk('fu_03', 'lead_009', 'Proposal Follow-up', 'Email', 2, '11:00', 'Pending'),
    mk('fu_04', 'lead_004', 'Deal Closure', 'Meeting', 3, '15:30', 'Pending'),
    mk('fu_05', 'lead_006', 'Introductory call', 'Call', 5, '12:00', 'Pending'),
    mk('fu_06', 'lead_007', 'Share revised proposal', 'Email', 6, '10:30', 'Pending'),
    mk('fu_07', 'lead_011', 'POC scoping', 'Meeting', 2, '16:00', 'Pending', 'u_meera'),
    mk('fu_08', 'lead_002', 'Thank-you note', 'Email', -1, '17:00', 'Done'),
    mk('fu_09', 'lead_005', 'Budget re-check', 'Call', -3, '11:00', 'Done'),
    mk('fu_10', 'lead_018', 'Licence count confirmation', 'WhatsApp', -1, '15:00', 'Pending'),
  ];
}

export function seedMeetings(): Meeting[] {
  const mk = (
    id: string,
    leadId: string,
    title: string,
    offset: number,
    time: string,
    status: Meeting['status'],
    mode: Meeting['mode'] = 'Online',
    ownerId = 'u_dinesh',
  ): Meeting => ({
    id,
    leadId,
    title,
    date: isoOffset(offset),
    time,
    durationMins: 30 + (id.charCodeAt(id.length - 1) % 3) * 15,
    mode,
    location: mode === 'Online' ? 'Google Meet' : mode === 'Phone' ? 'Phone call' : 'Client office',
    attendees: '',
    notes: '',
    status,
    ownerId,
    createdAt: isoDateTime(Math.min(offset, 0) - 3),
  });
  return [
    // Today
    mk('mt_01', 'lead_001', 'Product demo', 0, '10:00', 'Scheduled'),
    mk('mt_02', 'lead_018', 'Licence negotiation', 0, '11:30', 'Scheduled', 'Phone'),
    mk('mt_03', 'lead_024', 'Discovery call', 0, '12:30', 'Scheduled'),
    mk('mt_04', 'lead_015', 'Intro meeting', 0, '14:00', 'Scheduled', 'Phone', 'u_meera'),
    mk('mt_05', 'lead_007', 'Proposal walkthrough', 0, '15:30', 'Scheduled'),
    mk('mt_06', 'lead_012', 'Compliance review', 0, '16:30', 'Scheduled', 'In Person', 'u_karthik'),
    mk('mt_07', 'lead_022', 'Case study review', 0, '17:30', 'Scheduled', 'Online', 'u_meera'),
    // Upcoming
    mk('mt_08', 'lead_024', 'Pricing discussion', 1, '10:30', 'Scheduled'),
    mk('mt_09', 'lead_011', 'POC kickoff', 1, '15:00', 'Scheduled', 'In Person', 'u_meera'),
    mk('mt_10', 'lead_009', 'Proposal follow-up', 2, '11:00', 'Scheduled'),
    mk('mt_11', 'lead_016', 'Technical deep-dive', 3, '12:30', 'Scheduled'),
    mk('mt_12', 'lead_021', 'Security review', 5, '16:00', 'Scheduled', 'Online', 'u_karthik'),
    // Completed (past)
    mk('mt_13', 'lead_002', 'Requirement discussion', -1, '11:30', 'Completed'),
    mk('mt_14', 'lead_003', 'Pricing call', -2, '14:00', 'Completed'),
    mk('mt_15', 'lead_004', 'Contract signing', -3, '15:30', 'Completed', 'In Person'),
    mk('mt_16', 'lead_005', 'Budget review', -4, '16:00', 'Completed'),
    mk('mt_17', 'lead_007', 'Discovery', -6, '12:00', 'Completed'),
    mk('mt_18', 'lead_020', 'Upsell review', -8, '15:00', 'Completed', 'In Person'),
    mk('mt_19', 'lead_010', 'Final negotiation', -9, '10:30', 'Completed', 'In Person', 'u_karthik'),
    mk('mt_20', 'lead_023', 'Renewal call', -10, '13:30', 'Completed', 'Phone'),
    mk('mt_21', 'lead_013', 'Onboarding plan', -12, '11:00', 'Completed'),
    mk('mt_22', 'lead_017', 'Payment follow-up', -16, '10:00', 'Completed', 'Phone', 'u_karthik'),
    mk('mt_23', 'lead_019', 'Site visit', -20, '14:00', 'Completed', 'In Person'),
    mk('mt_24', 'lead_008', 'Intro call', -7, '13:00', 'Cancelled', 'Phone'),
  ];
}

export function seedTasks(): Task[] {
  const mk = (
    id: string,
    title: string,
    offset: number,
    priority: Priority,
    status: Task['status'],
    leadId = '',
    assigneeId = 'u_dinesh',
    description = '',
  ): Task => ({
    id,
    title,
    description,
    dueDate: isoOffset(offset),
    priority,
    status,
    leadId,
    assigneeId,
    createdAt: isoDateTime(-5),
  });
  return [
    mk('tk_01', 'Prepare demo environment for ABC Technologies', 0, 'High', 'In Progress', 'lead_001', 'u_dinesh', 'Load sample data and enable the analytics module.'),
    mk('tk_02', 'Send pricing sheet to Tech Innovators', 1, 'High', 'To Do', 'lead_003'),
    mk('tk_03', 'Update CRM notes after Global Systems closure', -1, 'Medium', 'Done', 'lead_004'),
    mk('tk_04', 'Draft proposal for Bright Minds', 2, 'Medium', 'To Do', 'lead_009'),
    mk('tk_05', 'Call Mega Corp to qualify requirement', -1, 'High', 'To Do', 'lead_006', 'u_dinesh', 'Overdue: they asked for a callback.'),
    mk('tk_06', 'Collect feedback from XYZ Solutions', 4, 'Low', 'To Do', 'lead_002'),
    mk('tk_07', 'Weekly pipeline review notes', 3, 'Low', 'In Progress', ''),
    mk('tk_08', 'Review user access for new joiners', 1, 'Medium', 'To Do', '', 'u_admin'),
    mk('tk_09', 'Audit inactive accounts', 5, 'Low', 'To Do', '', 'u_admin'),
  ];
}

export function seedNotifications(): AppNotification[] {
  return [
    { id: 'nt_01', type: 'follow-up', title: 'Follow-up due today', message: 'Product Demo with ABC Technologies at 10:00 AM.', link: '/follow-ups', read: false, createdAt: isoDateTime(0, 8, 0), userId: 'all' },
    { id: 'nt_02', type: 'meeting', title: 'Meeting in 1 hour', message: 'Licence negotiation with GreenLeaf Agro.', link: '/calendar', read: true, createdAt: isoDateTime(-1, 17, 0), userId: 'all' },
    { id: 'nt_03', type: 'lead', title: 'New lead assigned', message: 'Horizon Telecom has been assigned to you.', link: '/leads/lead_024', read: true, createdAt: isoDateTime(-2, 11, 0), userId: 'u_dinesh' },
    { id: 'nt_04', type: 'task', title: 'Task overdue', message: 'Call Mega Corp to qualify requirement.', link: '/tasks', read: true, createdAt: isoDateTime(-1, 9, 0), userId: 'u_dinesh' },
    { id: 'nt_05', type: 'system', title: 'Welcome to Vaeto CRM', message: 'This is a demo workspace. Data is stored only in your browser.', link: '/settings', read: true, createdAt: isoDateTime(-3, 9, 0), userId: 'all' },
    { id: 'nt_06', type: 'system', title: 'Inactive user detected', message: 'Rohan S has not logged in for 30 days.', link: '/admin/users', read: false, createdAt: isoDateTime(-1, 10, 0), userId: 'u_admin' },
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
