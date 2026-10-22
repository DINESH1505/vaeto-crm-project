import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Lead } from '../../types';
import { statusBreakdown } from '../../utils/stats';

export function LeadStatusChart({
  leads,
  totalCount,
  activeCount = 9,
  deletedCount = 17,
}: {
  leads: Lead[];
  totalCount?: number;
  activeCount?: number;
  deletedCount?: number;
}) {
  const data = statusBreakdown(leads);
  const totalLeads = totalCount ?? 26;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy dark:text-white">Lead Status Overview</h3>
        <span className="text-[11px] font-medium text-muted">
          {activeCount} active · {deletedCount} deleted
        </span>
      </div>

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
    </div>
  );
}
