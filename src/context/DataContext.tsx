import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  ActivityEntry,
  AppNotification,
  FollowUp,
  FollowUpStatus,
  FollowUpType,
  Lead,
  LeadStatus,
  Meeting,
  MeetingMode,
  MeetingStatus,
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
import { dateTimeValue, setDateFormat, todayISO } from '../utils/date';
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

  addFollowUp: (f: Omit<FollowUp, 'id' | 'createdAt'>) => Promise<FollowUp>;
  updateFollowUp: (id: string, patch: Partial<FollowUp>) => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;

  addMeeting: (m: Omit<Meeting, 'id' | 'createdAt'>) => Promise<Meeting>;
  updateMeeting: (id: string, patch: Partial<Meeting>) => Promise<void>;
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
    total: 0,
    active: 0,
    deleted: 0,
  });

  const refreshLeads = useCallback(async () => {
    try {
      setIsLoadingLeads(true);
      const [leadsRes, statsRes, followUpsRes, meetingsRes]: any = await Promise.allSettled([
        crmApi.getLeads({ page: 0, size: 500 }),
        crmApi.getStats(),
        crmApi.getFollowUps({ page: 0, size: 500 }),
        crmApi.getMeetings(),
      ]);

      if (leadsRes.status === 'fulfilled') {
        const res = leadsRes.value;
        const pagedData = res?.data || res;
        const initialItems = pagedData?.content || (Array.isArray(pagedData) ? pagedData : []);
        const allItems = [...initialItems];

        const totalPages = Number(pagedData?.totalPages) || 1;
        if (totalPages > 1) {
          const remainingPagePromises = [];
          for (let p = 1; p < totalPages; p++) {
            remainingPagePromises.push(crmApi.getLeads({ page: p, size: 500 }));
          }
          const remainingResults = await Promise.all(remainingPagePromises);
          for (const r of remainingResults) {
            const rd = r?.data || r;
            const items = rd?.content || (Array.isArray(rd) ? rd : []);
            allItems.push(...items);
          }
        }

        const seenLeadIds = new Set<string>();
        const mappedLeads: Lead[] = [];
        for (const item of allItems) {
          const sid = String(item.id);
          if (!seenLeadIds.has(sid)) {
            seenLeadIds.add(sid);
            mappedLeads.push({
              id: sid,
              company: item.company || 'Unnamed Company',
              contactName: item.contactName || '',
              title: item.title || item.jobTitle || '',
              email: item.email || '',
              phone: item.phone || '',
              corporatePhone: item.corporatePhone || '',
              whatsappNumber: item.whatsappNumber || '',
              status: (item.status || 'New') as LeadStatus,
              completedOn: item.completedOn || (item.connectedOn ? String(item.connectedOn) : ''),
              meetingDate: item.meetingDate || '',
              meetingTime: item.meetingTime || '',
              lastContact: item.lastContact || '',
              nextFollowUpDate: item.nextFollowUpDate || '',
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
            });
          }
        }
        setLeads(mappedLeads);
      }

      if (followUpsRes.status === 'fulfilled') {
        const fRes = followUpsRes.value;
        const pagedData = fRes?.data || fRes;
        const initialFItems = pagedData?.content || (Array.isArray(pagedData) ? pagedData : []);
        const allFItems = [...initialFItems];

        const fTotalPages = Number(pagedData?.totalPages) || 1;
        if (fTotalPages > 1) {
          const fPromises = [];
          for (let p = 1; p < fTotalPages; p++) {
            fPromises.push(crmApi.getFollowUps({ page: p, size: 500 }));
          }
          const fResults = await Promise.all(fPromises);
          for (const r of fResults) {
            const rd = r?.data || r;
            const items = rd?.content || (Array.isArray(rd) ? rd : []);
            allFItems.push(...items);
          }
        }

        const seenIds = new Set<string>();
        const mappedFollowUps: FollowUp[] = [];
        for (const item of allFItems) {
          const sid = String(item.id);
          if (!seenIds.has(sid)) {
            seenIds.add(sid);
            mappedFollowUps.push({
              id: sid,
              leadId: String(item.leadId || ''),
              title: item.title || 'Follow-up',
              type: (item.type || 'Call') as FollowUpType,
              date: item.date || '',
              time: item.time || '10:00',
              notes: item.notes || '',
              status: (item.status === 'Completed' || item.status === 'Done' ? 'Done' : 'Pending') as FollowUpStatus,
              ownerId: String(item.ownerId || '1'),
              createdAt: item.createdAt || nowISO(),
            });
          }
        }
        setFollowUps(mappedFollowUps);
      }

      if (meetingsRes.status === 'fulfilled') {
        const mRes = meetingsRes.value;
        const mItems = mRes?.data || mRes;
        if (Array.isArray(mItems)) {
          const mappedMeetings: Meeting[] = mItems.map((item: any) => ({
            id: String(item.id),
            leadId: String(item.leadId || ''),
            title: item.title || 'Meeting',
            date: item.date || '',
            time: item.time || '10:00',
            durationMins: Number(item.durationMins) || 30,
            mode: (item.mode || 'Online') as MeetingMode,
            location: item.location || '',
            attendees: item.attendees || '',
            notes: item.notes || '',
            status: (item.status || 'Scheduled') as MeetingStatus,
            ownerId: String(item.ownerId || '1'),
            createdAt: item.createdAt || nowISO(),
          }));
          setMeetings(mappedMeetings);
        }
      }

      if (statsRes.status === 'fulfilled') {
        const sRes = statsRes.value;
        const s = sRes?.data || sRes;
        if (s) {
          setDashboardStats(s);
          if (s.totalLeads?.value !== undefined || s.activeLeads !== undefined) {
            setLeadCounts({
              total: Number(s.totalLeads?.value ?? 0),
              active: Number(s.activeLeads ?? 0),
              deleted: Number(s.deletedLeads ?? 0),
            });
          }
        }
      }
    } catch (err) {
      console.warn('Backend leads API unavailable, using cached leads:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [setLeads, setFollowUps, setMeetings]);

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

  const inFlightFollowUps = useRef<Set<string>>(new Set());

  /** Create / update / cancel the earliest pending follow-up of a lead. */
  const applyNextFollowUp = async (leadId: string, next: NextFollowUpInput | undefined, ownerId: string) => {
    if (next === undefined) return;

    const opKey = `${leadId}-${next?.date}-${next?.time}-${next?.title}`;
    if (inFlightFollowUps.current.has(opKey)) {
      return;
    }
    inFlightFollowUps.current.add(opKey);

    const pending = followUps
      .filter((f) => String(f.leadId) === String(leadId) && f.status === 'Pending')
      .sort((a, b) => dateTimeValue(a.date, a.time) - dateTimeValue(b.date, b.time))[0];

    try {
      if (next && next.date) {
        if (pending) {
          await crmApi.updateFollowUp(pending.id, {
            leadId,
            title: next.title || pending.title || 'Follow-up',
            type: next.type || pending.type || 'Call',
            date: next.date,
            time: next.time || pending.time || '10:00',
            notes: pending.notes || '',
            status: 'Pending',
            ownerId,
          });
          setFollowUps((list) =>
            list.map((f) => (f.id === pending.id ? { ...f, ...next, title: next.title || f.title } : f))
          );
        } else {
          const res: any = await crmApi.createFollowUp({
            leadId,
            title: next.title || 'Follow-up',
            type: next.type || 'Call',
            date: next.date,
            time: next.time || '10:00',
            notes: '',
            status: 'Pending',
            ownerId,
          });
          const serverDto = res?.data || res;
          const realId = serverDto?.id ? String(serverDto.id) : uid('fu');

          setFollowUps((list) => {
            if (list.some((f) => String(f.id) === String(realId))) return list;
            return [
              ...list,
              {
                id: realId,
                leadId,
                title: next.title || 'Follow-up',
                type: next.type || 'Call',
                date: next.date,
                time: next.time || '10:00',
                notes: '',
                status: 'Pending',
                ownerId,
                createdAt: serverDto?.createdAt || nowISO(),
              },
            ];
          });
        }
        await refreshLeads();
      } else if (next === null || !next.date) {
        if (pending) {
          await crmApi.deleteFollowUp(pending.id);
          setFollowUps((list) => list.filter((f) => f.id !== pending.id));
          await refreshLeads();
        }
      }
    } catch (e) {
      console.warn('Failed to apply next follow-up:', e);
    } finally {
      inFlightFollowUps.current.delete(opKey);
    }
  };

  const addLead: DataApi['addLead'] = async (input, next) => {
    const at = nowISO();

    const res: any = await crmApi.createLead({
      company: input.company,
      contactName: input.contactName,
      title: input.title,
      email: input.email,
      phone: input.phone,
      corporatePhone: input.corporatePhone,
      whatsappNumber: input.whatsappNumber,
      countryCode: input.countryCode,
      status: input.status || 'New',
      completedOn: input.completedOn,
      meetingDate: input.meetingDate,
      meetingTime: input.meetingTime,
      lastContact: input.lastContact,
      nextFollowUpDate: next?.date || '',
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
      completedOn: serverLead?.completedOn || input.completedOn || todayISO(),
      status: (serverLead?.status || input.status || 'New') as LeadStatus,
      id: realId,
      createdAt: serverLead?.createdAt || at,
      updatedAt: serverLead?.updatedAt || at,
      activity: [activity('created', `Lead created from ${input.source || 'manual entry'}`)],
    };

    setLeads((l) => [lead, ...l]);
    setLeadCounts((prev) => ({
      total: prev.total + 1,
      active: prev.active + 1,
      deleted: prev.deleted,
    }));
    setDashboardStats((prev: any) => {
      if (!prev) return prev;
      const curTotal = prev.totalLeads?.value ?? 0;
      const curContacts = prev.totalContacts?.value ?? 0;
      return {
        ...prev,
        totalLeads: {
          ...prev.totalLeads,
          value: curTotal + 1,
        },
        totalContacts: {
          ...prev.totalContacts,
          value: curContacts + 1,
        },
        activeLeads: (prev.activeLeads ?? curTotal) + 1,
      };
    });
    try {
      const fetchStats = crmApi.getStats || crmApi.getDashboardStats;
      if (typeof fetchStats === 'function') {
        fetchStats().then((s: any) => {
          if (s) {
            const statsData = s.data || s;
            setDashboardStats(statsData);
            if (statsData.totalLeads?.value !== undefined || statsData.activeLeads !== undefined) {
              setLeadCounts({
                total: Number(statsData.totalLeads?.value ?? 0),
                active: Number(statsData.activeLeads ?? 0),
                deleted: Number(statsData.deletedLeads ?? 0),
              });
            }
          }
        }).catch((err) => {
          console.warn('Non-blocking dashboard stats refresh failed:', err);
        });
      }
    } catch (err) {
      console.warn('Non-blocking dashboard stats trigger error:', err);
    }
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
      completedOn: current.completedOn || patch.completedOn || todayISO(),
      updatedAt: nowISO(),
      activity: [...entries, ...current.activity],
    };

    // Await backend API call to update MySQL database
    const res = await crmApi.updateLead(id, {
      company: updatedLead.company,
      contactName: updatedLead.contactName,
      title: updatedLead.title,
      email: updatedLead.email,
      phone: updatedLead.phone,
      corporatePhone: updatedLead.corporatePhone,
      whatsappNumber: updatedLead.whatsappNumber,
      countryCode: updatedLead.countryCode,
      status: updatedLead.status,
      completedOn: updatedLead.completedOn,
      meetingDate: updatedLead.meetingDate,
      meetingTime: updatedLead.meetingTime,
      lastContact: updatedLead.lastContact,
      nextFollowUpDate: next !== undefined ? (next?.date || '') : updatedLead.nextFollowUpDate,
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

    if (patch.meetingDate !== undefined || patch.meetingTime !== undefined) {
      await refreshLeads();
    }

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

    setLeadCounts((prev) => ({
      total: prev.total,
      active: Math.max(0, prev.active - ids.length),
      deleted: prev.deleted + ids.length,
    }));
    setDashboardStats((prev: any) => {
      if (!prev) return prev;
      const curTotal = prev.totalLeads?.value ?? 0;
      const curContacts = prev.totalContacts?.value ?? 0;
      return {
        ...prev,
        totalLeads: {
          ...prev.totalLeads,
          value: curTotal,
        },
        totalContacts: {
          ...prev.totalContacts,
          value: Math.max(0, curContacts - ids.length),
        },
        activeLeads: Math.max(0, (prev.activeLeads ?? curContacts) - ids.length),
        deletedLeads: (prev.deletedLeads ?? 0) + ids.length,
      };
    });

    try {
      const fetchStats = crmApi.getStats || crmApi.getDashboardStats;
      if (typeof fetchStats === 'function') {
        const s: any = await fetchStats();
        if (s) {
          const statsData = s.data || s;
          setDashboardStats(statsData);
          if (statsData.totalLeads?.value !== undefined || statsData.activeLeads !== undefined) {
            setLeadCounts({
              total: Number(statsData.totalLeads?.value ?? 0),
              active: Number(statsData.activeLeads ?? 0),
              deleted: Number(statsData.deletedLeads ?? 0),
            });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to refresh dashboard stats after delete', e);
    }
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

  const addFollowUp: DataApi['addFollowUp'] = async (f) => {
    try {
      const res: any = await crmApi.createFollowUp({
        leadId: f.leadId,
        title: f.title,
        type: f.type,
        date: f.date,
        time: f.time,
        notes: f.notes,
        status: f.status,
        ownerId: f.ownerId,
      });
      const serverDto = res?.data || res;
      const realId = serverDto?.id ? String(serverDto.id) : uid('fu');
      const item: FollowUp = {
        ...f,
        id: realId,
        createdAt: serverDto?.createdAt || nowISO(),
      };
      setFollowUps((l) => {
        if (l.some((x) => String(x.id) === String(realId))) return l;
        return [...l, item];
      });
      logOnLead(f.leadId, 'follow-up', `Follow-up "${f.title}" scheduled for ${f.date}`);
      await refreshLeads();
      return item;
    } catch (e) {
      console.warn('Failed to add follow-up to backend:', e);
      const fallbackItem: FollowUp = { ...f, id: uid('fu'), createdAt: nowISO() };
      setFollowUps((l) => [...l, fallbackItem]);
      return fallbackItem;
    }
  };
  const updateFollowUp: DataApi['updateFollowUp'] = async (id, patch) => {
    const current = followUps.find((f) => f.id === id);
    try {
      if (patch.status === 'Done') {
        await crmApi.completeFollowUp(id);
      } else {
        await crmApi.updateFollowUp(id, patch);
      }
      setFollowUps((l) => l.map((f) => (f.id === id ? { ...f, ...patch } : f)));
      if (current && patch.status && patch.status !== current.status) {
        logOnLead(current.leadId, 'follow-up', `Follow-up "${current.title}" marked ${patch.status}`);
        if (patch.status === 'Done') {
          setLeads((list) => list.map((l) => (l.id === current.leadId ? { ...l, lastContact: current.date } : l)));
        }
      }
      await refreshLeads();
    } catch (error) {
      console.error('Failed to update follow-up:', error);
      throw error;
    }
  };
  const deleteFollowUp: DataApi['deleteFollowUp'] = async (id) => {
    try {
      await crmApi.deleteFollowUp(id);
      setFollowUps((l) => l.filter((f) => f.id !== id));
      await refreshLeads();
    } catch (error) {
      console.error('Failed to delete follow-up:', error);
      throw error;
    }
  };

  const addMeeting: DataApi['addMeeting'] = async (m) => {
    const item: Meeting = { ...m, id: uid('mt'), createdAt: nowISO() };

    // 1. Optimistic update in meetings list
    setMeetings((l) => [...l, item]);

    // 2. Optimistic update in leads list
    setLeads((list) =>
      list.map((lead) => {
        if (String(lead.id) === String(m.leadId)) {
          return {
            ...lead,
            meetingDate: m.date,
            meetingTime: m.time,
            status: lead.status === 'New' ? 'Meeting Scheduled' : lead.status,
            updatedAt: nowISO(),
          };
        }
        return lead;
      })
    );

    // 3. Optimistic update in dashboard stats for Today's Meetings
    const today = todayISO();
    if (m.date === today && m.status !== 'Cancelled') {
      setDashboardStats((prev: any) => {
        if (!prev) return prev;
        const currentVal = prev.todaysMeetings?.value ?? 0;
        return {
          ...prev,
          todaysMeetings: {
            ...prev.todaysMeetings,
            value: currentVal + 1,
            trend: '+100% vs last week',
          },
        };
      });
    }

    logOnLead(m.leadId, 'meeting', `Meeting "${m.title}" scheduled for ${m.date} ${m.time}`);
    notify({ type: 'meeting', title: 'Meeting scheduled', message: `${m.title} on ${m.date} at ${m.time}.`, link: '/calendar', userId: m.ownerId });

    // 4. Persist to backend and sync all state
    try {
      await crmApi.createMeeting({
        leadId: m.leadId,
        title: m.title,
        date: m.date,
        time: m.time,
        durationMins: m.durationMins,
        mode: m.mode,
        location: m.location,
        attendees: m.attendees,
        notes: m.notes,
        status: m.status,
        ownerId: m.ownerId,
      });
      await refreshLeads();
    } catch (err) {
      console.error('Failed to create meeting:', err);
    }

    return item;
  };
  const updateMeeting: DataApi['updateMeeting'] = async (id, patch) => {
    const current = meetings.find((m) => m.id === id);
    if (!current) return;

    const previousStatus = current.status;
    const nextStatus = patch.status || previousStatus;

    // 1. Optimistic update in meetings list
    setMeetings((l) => l.map((m) => (m.id === id ? { ...m, ...patch } : m)));

    // 2. Optimistic update in dashboard stats for Completed Meetings
    if (patch.status && patch.status !== previousStatus) {
      logOnLead(current.leadId, 'meeting', `Meeting "${current.title}" marked ${patch.status}`);

      setDashboardStats((prev: any) => {
        if (!prev) return prev;
        const currentCompleted = prev.completedMeetings?.value ?? 0;
        let nextCompleted = currentCompleted;
        if (nextStatus === 'Completed' && previousStatus !== 'Completed') {
          nextCompleted = currentCompleted + 1;
        } else if (previousStatus === 'Completed' && nextStatus !== 'Completed') {
          nextCompleted = Math.max(0, currentCompleted - 1);
        }

        const currentToday = prev.todaysMeetings?.value ?? 0;
        let nextToday = currentToday;
        const isScheduledToday = current.date === todayISO();
        if (isScheduledToday) {
          if (nextStatus === 'Completed' && previousStatus !== 'Completed') {
            nextToday = Math.max(0, currentToday - 1);
          } else if (previousStatus === 'Completed' && nextStatus !== 'Completed') {
            nextToday = currentToday + 1;
          }
        }

        return {
          ...prev,
          completedMeetings: {
            ...prev.completedMeetings,
            value: nextCompleted,
          },
          todaysMeetings: {
            ...prev.todaysMeetings,
            value: nextToday,
          },
        };
      });
    }

    // 3. Persist to backend and sync with database as source of truth
    try {
      if (patch.status === 'Completed') {
        await crmApi.completeMeeting(id);
      } else if (patch.status === 'Scheduled') {
        await crmApi.reopenMeeting(id);
      } else {
        await crmApi.updateMeeting(id, { ...current, ...patch });
      }
      await refreshLeads();
    } catch (err) {
      console.error('Failed to update meeting:', err);
    }
  };
  const deleteMeeting: DataApi['deleteMeeting'] = (id) => {
    setMeetings((l) => l.filter((m) => m.id !== id));
    crmApi.deleteMeeting(id).then(() => refreshLeads()).catch(() => {});
  };

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
