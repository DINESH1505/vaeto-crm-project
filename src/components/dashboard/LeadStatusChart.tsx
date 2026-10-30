import { BarChart2 } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Lead } from '../../types';
import { statusBreakdown } from '../../utils/stats';

const EMPTY_STATUS_LEGEND = [
  { label: 'New', color: '#0ea5e9' },
  { label: 'Negotiation', color: '#f59e0b' },
  { label: 'Contacted', color: '#8b5cf6' },
  { label: 'Won', color: '#ec4899' },
  { label: 'Proposal Sent', color: '#10b981' },
  { label: 'Lost', color: '#ef4444' },
];

export function LeadStatusChart({
  leads,
  totalCount,
  activeCount = 0,
  deletedCount = 0,
}: {
  leads: Lead[];
  totalCount?: number;
  activeCount?: number;
  deletedCount?: number;
}) {
  const data = statusBreakdown(leads);
  const totalLeads = totalCount ?? leads.length;

  return (
    <div className="card flex flex-col justify-between p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy dark:text-white">Lead Status Overview</h3>
        {(totalLeads > 0 || deletedCount > 0) && (
          <span className="text-[11px] font-medium text-muted">
            {activeCount} active · {deletedCount} deleted
          </span>
        )}
      </div>

      {totalLeads === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-900/30">
            <BarChart2 className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h4 className="mt-3 text-sm font-bold text-navy dark:text-white">No leads yet</h4>
          <p className="mt-1 text-xs text-muted">Import your leads from Excel to get started.</p>

          {/* 2-Column Status Legend matching empty state reference */}
          <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-2.5 text-left text-xs">
            {EMPTY_STATUS_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-navy dark:text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="relative mt-2 flex h-48 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} leads`, name]}
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface))',
                    borderColor: 'rgb(var(--line))',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Count */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-navy dark:text-white">{totalLeads}</span>
              <span className="text-[11px] font-medium text-muted">Total Leads</span>
            </div>
          </div>

          {/* Legend list matching reference image */}
          <div className="mt-3 space-y-1.5">
            {data.map((item) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-ink">{item.status}</span>
                </div>
                <div className="space-x-1.5 text-muted">
                  <span className="font-semibold text-ink">{item.count}</span>
                  <span>({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
