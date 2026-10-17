import type { FollowUp, Lead, LeadStatus, Meeting } from '../types';
import { LEAD_STATUSES } from '../types';
import { addDays, dateTimeValue, isoOffset, toISODate, todayISO } from './date';

export interface StatValue {
  value: number;
  trend: number; // percentage change vs last week
  spark: number[];
}

export interface DashboardStats {
  totalLeads: StatValue;
  totalContacts: StatValue;
  todaysMeetings: StatValue;
  followUps: StatValue;
  completedMeetings: StatValue;
}

const pct = (now: number, prev: number) => {
  if (prev === 0) return now > 0 ? 100 : 0;
  return Math.round(((now - prev) / prev) * 100);
};

/** Cumulative count of items whose date is on/before each of the last 7 days. */
function cumulativeSpark(dates: string[]): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = toISODate(addDays(new Date(), i - 6));
    return dates.filter((d) => d && d <= day).length;
  });
}

export function computeDashboardStats(leads: Lead[], followUps: FollowUp[], meetings: Meeting[]): DashboardStats {
  const today = todayISO();
  const weekAgo = isoOffset(-7);

  const leadDates = leads.map((l) => l.createdAt.slice(0, 10));
  const totalLeadsPrev = leadDates.filter((d) => d <= weekAgo).length;

  const contactDates = leads.map((l) => l.lastContact).filter(Boolean);
  const contactsPrev = contactDates.filter((d) => d <= weekAgo).length;

  const active = meetings.filter((m) => m.status !== 'Cancelled');
  const todays = active.filter((m) => m.date === today).length;
  const sameDayLastWeek = active.filter((m) => m.date === weekAgo).length;
  const meetingSpark = Array.from({ length: 7 }, (_, i) => {
    const day = isoOffset(i - 6);
    return active.filter((m) => m.date === day).length;
  });

  const pendingFollowUps = followUps.filter((f) => f.status === 'Pending');
  const nextWeek = followUps.filter((f) => f.date >= today && f.date < isoOffset(7)).length;
  const lastWeek = followUps.filter((f) => f.date < today && f.date >= weekAgo).length;
  const followSpark = Array.from({ length: 7 }, (_, i) => {
    const day = isoOffset(i - 3);
    return followUps.filter((f) => f.date === day).length;
  });

  const completed = meetings.filter((m) => m.status === 'Completed');
  const completedDates = completed.map((m) => m.date);
  const completedPrev = completedDates.filter((d) => d <= weekAgo).length;

  return {
    totalLeads: { value: leads.length, trend: pct(leads.length, totalLeadsPrev), spark: cumulativeSpark(leadDates) },
    totalContacts: { value: contactDates.length, trend: pct(contactDates.length, contactsPrev), spark: cumulativeSpark(contactDates) },
    todaysMeetings: { value: todays, trend: pct(todays, sameDayLastWeek), spark: meetingSpark },
    followUps: { value: pendingFollowUps.length, trend: pct(nextWeek, lastWeek), spark: followSpark },
    completedMeetings: { value: completed.length, trend: pct(completed.length, completedPrev), spark: cumulativeSpark(completedDates) },
  };
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  Scheduled: '#3b82f6',
  Completed: '#14b8a6',
  Pending: '#f59e0b',
  Lost: '#f43f5e',
  'In Progress': '#8b5cf6',
};

export function statusBreakdown(leads: Lead[]) {
  const total = leads.length;
  return LEAD_STATUSES.map((status) => {
    const count = leads.filter((l) => l.status === status).length;
    return {
      status,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
      color: STATUS_COLORS[status],
    };
  });
}

/** Earliest pending follow-up per lead. */
export function nextFollowUpMap(followUps: FollowUp[]): Map<string, FollowUp> {
  const map = new Map<string, FollowUp>();
  followUps
    .filter((f) => f.status === 'Pending')
    .sort((a, b) => dateTimeValue(a.date, a.time) - dateTimeValue(b.date, b.time))
    .forEach((f) => {
      if (!map.has(f.leadId)) map.set(f.leadId, f);
    });
  return map;
}
