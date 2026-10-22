import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  ActivityEntry,
  AppNotification,
  FollowUp,
  Lead,
  LeadStatus,
  Meeting,
  Priority,
  Role,
  SessionUser,
  SystemSettings,
  Task,
  User,
} from '../types';
import {
  SEED_VERSION,
  seedFollowUps,
  seedLeads,
  seedMeetings,
  seedNotifications,
  seedRoles,
  seedSettings,
  seedTasks,
  seedUsers,
} from '../data/sampleData';
import { useLocalStorage } from '../hooks';
import { STORE_KEYS, readStore, writeStore } from '../utils/storage';
import { uid } from '../utils/helpers';
import { dateTimeValue, setDateFormat } from '../utils/date';
import { crmApi } from '../api';

export type LeadInput = Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activity'>;
export type NextFollowUpInput = { date: string; time: string; title: string; type: FollowUp['type'] } | null;

/** Write seed data on first run (or after a seed version bump). */
function ensureSeeded() {
  if (readStore<number>(STORE_KEYS.seeded, 0) === SEED_VERSION) return;
  writeStore(STORE_KEYS.leads, seedLeads());
  writeStore(STORE_KEYS.followUps, seedFollowUps());
  writeStore(STORE_KEYS.meetings, seedMeetings());
  writeStore(STORE_KEYS.tasks, seedTasks());
  writeStore(STORE_KEYS.notifications, seedNotifications());
  writeStore(STORE_KEYS.users, seedUsers());
  writeStore(STORE_KEYS.roles, seedRoles());
  writeStore(STORE_KEYS.settings, seedSettings());
  writeStore(STORE_KEYS.seeded, SEED_VERSION);
}

interface DataApi {
  leads: Lead[];
  isLoadingLeads: boolean;
  refreshLeads: () => Promise<void>;
  dashboardStats: any;
  leadCounts: { total: number; active: number; deleted: number };
  followUps: FollowUp[];
  meetings: Meeting[];
  tasks: Task[];
  notifications: AppNotification[];
  users: User[];
  roles: Role[];
  settings: SystemSettings;

  setActor: (user: SessionUser | null) => void;

  addLead: (input: LeadInput, next?: NextFollowUpInput) => Promise<Lead>;
  updateLead: (id: string, patch: Partial<LeadInput>, next?: NextFollowUpInput) => Promise<any>;
  deleteLeads: (ids: string[]) => Promise<void>;
  addLeadNote: (id: string, note: string) => void;

  addFollowUp: (f: Omit<FollowUp, 'id' | 'createdAt'>) => FollowUp;
  updateFollowUp: (id: string, patch: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;

  addMeeting: (m: Omit<Meeting, 'id' | 'createdAt'>) => Meeting;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;

  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  notify: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationsRead: (ids: string[], read?: boolean) => void;
  deleteNotifications: (ids: string[]) => void;

  addUser: (u: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addRole: (r: Omit<Role, 'id'>) => Role;
  updateRole: (id: string, patch: Partial<Role>) => void;
  deleteRole: (id: string) => void;

  updateSettings: (patch: Partial<SystemSettings>) => void;
  resetDemoData: () => void;
  exportAll: () => string;
}

const DataContext = createContext<DataApi | null>(null);

const nowISO = () => new Date().toISOString();

export function DataProvider({ children }: { children: ReactNode }) {
  useState(() => ensureSeeded()); // runs before the stores below read localStorage

  const [leads, setLeads] = useLocalStorage<Lead[]>(STORE_KEYS.leads, seedLeads);
  const [followUps, setFollowUps] = useLocalStorage<FollowUp[]>(STORE_KEYS.followUps, seedFollowUps);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>(STORE_KEYS.meetings, seedMeetings);
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORE_KEYS.tasks, seedTasks);
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(STORE_KEYS.notifications, seedNotifications);
  const [users, setUsers] = useLocalStorage<User[]>(STORE_KEYS.users, seedUsers);
  const [roles, setRoles] = useLocalStorage<Role[]>(STORE_KEYS.roles, seedRoles);
  const [settings, setSettings] = useLocalStorage<SystemSettings>(STORE_KEYS.settings, seedSettings);

  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [leadCounts, setLeadCounts] = useState<{ total: number; active: number; deleted: number }>({
    total: 26,
    active: 9,
    deleted: 17,
  });

  const refreshLeads = useCallback(async () => {
    try {
      setIsLoadingLeads(true);
      const [leadsRes, statsRes]: any = await Promise.allSettled([
        crmApi.getLeads({ size: 100 }),
        crmApi.getStats(),
      ]);

      if (leadsRes.status === 'fulfilled') {
        const res = leadsRes.value;
        const pagedData = res?.data || res;
        const items = pagedData?.content || (Array.isArray(pagedData) ? pagedData : null);
        if (items && Array.isArray(items)) {
          const mappedLeads: Lead[] = items.map((item: any) => ({
            id: String(item.id),
            company: item.company || 'Unnamed Company',
            contactName: item.contactName || '',
            email: item.email || '',
            phone: item.phone || '',
            status: (item.status || 'New') as LeadStatus,
            meetingDate: item.meetingDate || '',
            meetingTime: item.meetingTime || '',
            lastContact: item.lastContact || '',
            comments: item.comments || '',
            source: item.source || 'Website',
            industry: item.industry || 'IT Services',
            dealValue: Number(item.dealValue) || 0,
            priority: (item.priority || 'Medium') as Priority,
            ownerId: String(item.ownerId || '1'),
            address: item.address || 'India',
            website: item.website || '',
            createdAt: item.createdAt || nowISO(),
            updatedAt: item.updatedAt || nowISO(),
            activity: item.activity || [],
          }));
          setLeads(mappedLeads);
        }
      }

      if (statsRes.status === 'fulfilled') {
        const sRes = statsRes.value;
        const s = sRes?.data || sRes;
        if (s) {
          setDashboardStats(s);
          if (s.totalLeads?.value !== undefined || s.activeLeads !== undefined) {
            setLeadCounts({
              total: Number(s.totalLeads?.value ?? 26),
              active: Number(s.activeLeads ?? 9),
              deleted: Number(s.deletedLeads ?? 17),
            });
          }
        }
      }
    } catch (err) {
      console.warn('Backend leads API unavailable, using cached leads:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [setLeads]);

  useEffect(() => {
    refreshLeads();
  }, [refreshLeads]);

  // Ensure all standard seed accounts exist in user store
  useEffect(() => {
    const seeds = seedUsers();
    setUsers((current) => {
      const missing = seeds.filter((s) => !current.some((u) => u.email.toLowerCase() === s.email.toLowerCase()));
      if (missing.length === 0) return current;
      return [...current, ...missing];
    });
  }, [setUsers]);

  const actor = useRef<SessionUser | null>(null);
  const setActor = useCallback((u: SessionUser | null) => {
    actor.current = u;
  }, []);
  const actorName = () => actor.current?.name ?? 'System';

  useEffect(() => setDateFormat(settings.dateFormat), [settings.dateFormat]);

  const activity = (type: ActivityEntry['type'], message: string): ActivityEntry => ({
    id: uid('act'),
    type,
    message,
    at: nowISO(),
    by: actorName(),
  });

  const notify = useCallback<DataApi['notify']>(
    (n) => setNotifications((list) => [{ ...n, id: uid('nt'), createdAt: nowISO(), read: false }, ...list].slice(0, 100)),
    [setNotifications],
  );

  /** Create / update / cancel the earliest pending follow-up of a lead. */
  const applyNextFollowUp = (leadId: string, next: NextFollowUpInput | undefined, ownerId: string) => {
    if (next === undefined) return;
    setFollowUps((list) => {
      const pending = list
        .filter((f) => f.leadId === leadId && f.status === 'Pending')
        .sort((a, b) => dateTimeValue(a.date, a.time) - dateTimeValue(b.date, b.time))[0];
      if (next === null || !next.date) {
        return pending ? list.filter((f) => f.id !== pending.id) : list;
      }
      if (pending) {
        return list.map((f) => (f.id === pending.id ? { ...f, ...next, title: next.title || f.title } : f));
      }
      return [
        ...list,
        {
          id: uid('fu'),
          leadId,
          title: next.title || 'Follow-up',
          type: next.type,
          date: next.date,
          time: next.time,
          notes: '',
          status: 'Pending',
          ownerId,
          createdAt: nowISO(),
        },
      ];
    });
  };

  const addLead: DataApi['addLead'] = async (input, next) => {
    const at = nowISO();

    const res: any = await crmApi.createLead({
      company: input.company,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      countryCode: input.countryCode,
      status: input.status,
      meetingDate: input.meetingDate,
      meetingTime: input.meetingTime,
      lastContact: input.lastContact,
      comments: input.comments,
      source: input.source,
      industry: input.industry,
      dealValue: input.dealValue,
      priority: input.priority,
      ownerId: input.ownerId,
    });

    const serverLead = res?.data || res;
    const realId = serverLead?.id ? String(serverLead.id) : uid('lead');

    const lead: Lead = {
      ...input,
      id: realId,
      createdAt: serverLead?.createdAt || at,
      updatedAt: serverLead?.updatedAt || at,
      activity: [activity('created', `Lead created from ${input.source || 'manual entry'}`)],
    };

    setLeads((l) => [lead, ...l]);
    applyNextFollowUp(lead.id, next, input.ownerId);
    notify({
      type: 'lead',
      title: 'New lead added',
      message: `${lead.company} (${lead.contactName}) was added by ${actorName()}.`,
      link: `/leads/${lead.id}`,
      userId: 'all',
    });

    return lead;
  };

  const updateLead: DataApi['updateLead'] = async (id, patch, next) => {
    const current = leads.find((l) => l.id === id);
    if (!current) throw new Error('Lead not found with id: ' + id);

    const entries: ActivityEntry[] = [];
    if (patch.status && patch.status !== current.status) {
      entries.push(activity('status', `Status changed from ${current.status} to ${patch.status}`));
    }
    const changedFields = Object.keys(patch).filter(
      (k) => k !== 'status' && (patch as Record<string, unknown>)[k] !== (current as unknown as Record<string, unknown>)[k],
    );
    if (changedFields.length) entries.push(activity('updated', `Updated ${changedFields.length} field(s)`));
    if (next !== undefined) entries.push(activity('follow-up', next?.date ? `Next follow-up set for ${next.date}` : 'Next follow-up cleared'));

    const updatedLead: Lead = {
      ...current,
      ...patch,
      updatedAt: nowISO(),
      activity: [...entries, ...current.activity],
    };

    // Await backend API call to update MySQL database
    const res = await crmApi.updateLead(id, {
      company: updatedLead.company,
      contactName: updatedLead.contactName,
      email: updatedLead.email,
      phone: updatedLead.phone,
      countryCode: updatedLead.countryCode,
      status: updatedLead.status,
      meetingDate: updatedLead.meetingDate,
      meetingTime: updatedLead.meetingTime,
      lastContact: updatedLead.lastContact,
      comments: updatedLead.comments,
      source: updatedLead.source,
      industry: updatedLead.industry,
      dealValue: updatedLead.dealValue,
      priority: updatedLead.priority,
    });

    setLeads((list) =>
      list.map((l) => (l.id === id ? updatedLead : l)),
    );
    applyNextFollowUp(id, next, patch.ownerId ?? current.ownerId);

    return res;
  };

  const deleteLeads: DataApi['deleteLeads'] = async (ids) => {
    if (actor.current) {
      const userRole = roles.find((r) => r.id === actor.current?.roleId);
      const canDelete = userRole?.isAdmin || userRole?.permissions.includes('leads.delete');
      if (!canDelete) {
        throw new Error('Unauthorized: Only administrators are permitted to delete leads.');
      }
    }
    await Promise.all(
      ids.map(async (id) => {
        await crmApi.deleteLead(id);
      })
    );
    const set = new Set(ids);
    setLeads((l) => l.filter((x) => !set.has(x.id)));
    setFollowUps((l) => l.filter((x) => !set.has(x.leadId)));
    setMeetings((l) => l.filter((x) => !set.has(x.leadId)));
    setTasks((l) => l.map((t) => (set.has(t.leadId) ? { ...t, leadId: '' } : t)));
  };

  const addLeadNote: DataApi['addLeadNote'] = (id, note) => {
    setLeads((list) =>
      list.map((l) =>
        l.id === id ? { ...l, comments: note, updatedAt: nowISO(), activity: [activity('note', note), ...l.activity] } : l,
      ),
    );
  };

  const logOnLead = (leadId: string, type: ActivityEntry['type'], message: string) => {
    if (!leadId) return;
    setLeads((list) => list.map((l) => (l.id === leadId ? { ...l, activity: [activity(type, message), ...l.activity] } : l)));
  };

  const addFollowUp: DataApi['addFollowUp'] = (f) => {
    const item: FollowUp = { ...f, id: uid('fu'), createdAt: nowISO() };
    setFollowUps((l) => [...l, item]);
    logOnLead(f.leadId, 'follow-up', `Follow-up "${f.title}" scheduled for ${f.date}`);
    return item;
  };
  const updateFollowUp: DataApi['updateFollowUp'] = (id, patch) => {
    const current = followUps.find((f) => f.id === id);
    setFollowUps((l) => l.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    if (current && patch.status && patch.status !== current.status) {
      logOnLead(current.leadId, 'follow-up', `Follow-up "${current.title}" marked ${patch.status}`);
      if (patch.status === 'Done') {
        setLeads((list) => list.map((l) => (l.id === current.leadId ? { ...l, lastContact: current.date } : l)));
      }
    }
  };
  const deleteFollowUp: DataApi['deleteFollowUp'] = (id) => setFollowUps((l) => l.filter((f) => f.id !== id));

  const addMeeting: DataApi['addMeeting'] = (m) => {
    const item: Meeting = { ...m, id: uid('mt'), createdAt: nowISO() };
    setMeetings((l) => [...l, item]);
    logOnLead(m.leadId, 'meeting', `Meeting "${m.title}" scheduled for ${m.date} ${m.time}`);
    notify({ type: 'meeting', title: 'Meeting scheduled', message: `${m.title} on ${m.date} at ${m.time}.`, link: '/calendar', userId: m.ownerId });
    return item;
  };
  const updateMeeting: DataApi['updateMeeting'] = (id, patch) => {
    const current = meetings.find((m) => m.id === id);
    setMeetings((l) => l.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    if (current && patch.status && patch.status !== current.status) {
      logOnLead(current.leadId, 'meeting', `Meeting "${current.title}" marked ${patch.status}`);
    }
  };
  const deleteMeeting: DataApi['deleteMeeting'] = (id) => setMeetings((l) => l.filter((m) => m.id !== id));

  const addTask: DataApi['addTask'] = (t) => {
    const item: Task = { ...t, id: uid('tk'), createdAt: nowISO() };
    setTasks((l) => [item, ...l]);
    return item;
  };
  const updateTask: DataApi['updateTask'] = (id, patch) => setTasks((l) => l.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const deleteTask: DataApi['deleteTask'] = (id) => setTasks((l) => l.filter((t) => t.id !== id));

  const markNotificationsRead: DataApi['markNotificationsRead'] = (ids, read = true) => {
    const set = new Set(ids);
    setNotifications((l) => l.map((n) => (set.has(n.id) ? { ...n, read } : n)));
  };
  const deleteNotifications: DataApi['deleteNotifications'] = (ids) => {
    const set = new Set(ids);
    setNotifications((l) => l.filter((n) => !set.has(n.id)));
  };

  const addUser: DataApi['addUser'] = (u) => {
    const item: User = { ...u, id: uid('u'), createdAt: nowISO(), lastLogin: '' };
    setUsers((l) => [...l, item]);
    return item;
  };
  const updateUser: DataApi['updateUser'] = (id, patch) => setUsers((l) => l.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  const deleteUser: DataApi['deleteUser'] = (id) => setUsers((l) => l.filter((u) => u.id !== id));

  const addRole: DataApi['addRole'] = (r) => {
    const item: Role = { ...r, id: uid('role') };
    setRoles((l) => [...l, item]);
    return item;
  };
  const updateRole: DataApi['updateRole'] = (id, patch) => setRoles((l) => l.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const deleteRole: DataApi['deleteRole'] = (id) => {
    setRoles((l) => l.filter((r) => r.id !== id));
    setUsers((l) => l.map((u) => (u.roleId === id ? { ...u, roleId: 'role_user' } : u)));
  };

  const updateSettings: DataApi['updateSettings'] = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const resetDemoData = () => {
    setLeads(seedLeads());
    setFollowUps(seedFollowUps());
    setMeetings(seedMeetings());
    setTasks(seedTasks());
    setNotifications(seedNotifications());
    setUsers(seedUsers());
    setRoles(seedRoles());
    setSettings(seedSettings());
  };

  const exportAll = () =>
    JSON.stringify(
      { exportedAt: nowISO(), note: 'Vaeto CRM demo data export', leads, followUps, meetings, tasks, roles, settings,
        users: users.map(({ password: _pw, ...rest }) => rest) },
      null,
      2,
    );

  const value: DataApi = {
    leads, isLoadingLeads, refreshLeads, dashboardStats, leadCounts, followUps, meetings, tasks, notifications, users, roles, settings,
    setActor,
    addLead, updateLead, deleteLeads, addLeadNote,
    addFollowUp, updateFollowUp, deleteFollowUp,
    addMeeting, updateMeeting, deleteMeeting,
    addTask, updateTask, deleteTask,
    notify, markNotificationsRead, deleteNotifications,
    addUser, updateUser, deleteUser,
    addRole, updateRole, deleteRole,
    updateSettings, resetDemoData, exportAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

/** Convenience lookups shared by many pages. */
export function useLookups() {
  const { leads, users } = useData();
  return useMemo(() => {
    const leadById = new Map(leads.map((l) => [l.id, l]));
    const userById = new Map(users.map((u) => [u.id, u]));
    return { leadById, userById };
  }, [leads, users]);
}
