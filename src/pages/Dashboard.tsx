import { useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { StatCard } from '../components/dashboard/StatCard';
import { LeadStatusChart } from '../components/dashboard/LeadStatusChart';
import { UpcomingFollowUps } from '../components/dashboard/UpcomingFollowUps';
import { useData } from '../context/DataContext';
import { computeDashboardStats } from '../utils/stats';

export default function Dashboard() {
  const { leads, followUps, meetings, dashboardStats, leadCounts, refreshLeads } = useData();

  useEffect(() => {
    refreshLeads();
  }, [refreshLeads]);

  // Compute 5 stat cards dynamically
  const stats = useMemo(() => computeDashboardStats(leads, followUps, meetings), [leads, followUps, meetings]);

  const totalLeadsValue = dashboardStats?.totalLeads?.value ?? leadCounts?.total ?? leads.length;
  const totalLeadsTrend = dashboardStats?.totalLeads?.trend ?? stats.totalLeads.trend;
  const totalLeadsSpark = dashboardStats?.totalLeads?.spark ?? stats.totalLeads.spark;

  const totalContactsValue = dashboardStats?.totalContacts?.value ?? stats.totalContacts.value;
  const totalContactsTrend = dashboardStats?.totalContacts?.trend ?? stats.totalContacts.trend;
  const totalContactsSpark = dashboardStats?.totalContacts?.spark ?? stats.totalContacts.spark;

  const todaysMeetingsValue = dashboardStats?.todaysMeetings?.value ?? stats.todaysMeetings.value;
  const todaysMeetingsTrend = dashboardStats?.todaysMeetings?.trend ?? stats.todaysMeetings.trend;
  const todaysMeetingsSpark = dashboardStats?.todaysMeetings?.spark ?? stats.todaysMeetings.spark;

  const followUpsValue = dashboardStats?.followUps?.value ?? stats.followUps.value;
  const followUpsTrend = dashboardStats?.followUps?.trend ?? stats.followUps.trend;
  const followUpsSpark = dashboardStats?.followUps?.spark ?? stats.followUps.spark;

  const completedMeetingsValue = dashboardStats?.completedMeetings?.value ?? stats.completedMeetings.value;
  const completedMeetingsTrend = dashboardStats?.completedMeetings?.trend ?? stats.completedMeetings.trend;
  const completedMeetingsSpark = dashboardStats?.completedMeetings?.spark ?? stats.completedMeetings.spark;

  const activeCount = leadCounts?.active ?? leads.length;
  const deletedCount = leadCounts?.deleted ?? 0;

  const hasActivity = totalLeadsValue > 0 || todaysMeetingsValue > 0 || followUpsValue > 0;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <WelcomeBanner hasActivity={hasActivity} />

      {/* 2. Top Metric Cards (5 cards matching reference) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={totalLeadsValue}
          trend={totalLeadsTrend}
          spark={totalLeadsSpark}
          icon={<Users className="h-4 w-4" />}
          iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
          lineColor="#6366f1"
          subInfo={totalLeadsValue > 0 || deletedCount > 0 ? `${activeCount} active · ${deletedCount} deleted` : undefined}
        />
        <StatCard
          title="Total Contacts"
          value={totalContactsValue}
          trend={totalContactsTrend}
          spark={totalContactsSpark}
          icon={<Users className="h-4 w-4" />}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          lineColor="#10b981"
        />
        <StatCard
          title="Today's Meetings"
          value={todaysMeetingsValue}
          trend={todaysMeetingsTrend}
          spark={todaysMeetingsSpark}
          icon={<Calendar className="h-4 w-4" />}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
          lineColor="#3b82f6"
        />
        <StatCard
          title="Follow-ups"
          value={followUpsValue}
          trend={followUpsTrend}
          spark={followUpsSpark}
          icon={<Clock className="h-4 w-4" />}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
          lineColor="#f59e0b"
        />
        <StatCard
          title="Completed Meetings"
          value={completedMeetingsValue}
          trend={completedMeetingsTrend}
          spark={completedMeetingsSpark}
          icon={<CheckCircle2 className="h-4 w-4" />}
          iconBg="bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300"
          lineColor="#ec4899"
        />
      </div>

      {/* 3. Lead Status Overview & Upcoming Follow-ups Panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <LeadStatusChart leads={leads} totalCount={totalLeadsValue} activeCount={activeCount} deletedCount={deletedCount} />
        <UpcomingFollowUps followUps={followUps} leads={leads} />
      </div>
    </div>
  );
}
