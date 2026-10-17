import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/helpers';

export default function Reports() {
  const { leads, meetings } = useData();

  // Industry revenue breakdown
  const industryData = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => {
      map.set(l.industry, (map.get(l.industry) || 0) + l.dealValue);
    });
    return Array.from(map.entries())
      .map(([industry, total]) => ({ industry, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [leads]);

  // Source distribution
  const sourceData = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => {
      map.set(l.source, (map.get(l.source) || 0) + 1);
    });
    return Array.from(map.entries()).map(([source, count]) => ({ source, count }));
  }, [leads]);

  const totalPipelineValue = leads.reduce((acc, l) => acc + l.dealValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
            Reports & Analytics
          </h1>
          <p className="text-xs text-muted">
            Performance metrics, lead conversion pipelines, and deal source analytics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Export Summary
        </Button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold text-muted">Total Pipeline Value</p>
          <p className="mt-1 text-2xl font-black text-brand-700 dark:text-brand-300">
            {formatCurrency(totalPipelineValue)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Across {leads.length} recorded leads
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold text-muted">Completed Meetings</p>
          <p className="mt-1 text-2xl font-black text-navy dark:text-white">
            {meetings.filter((m) => m.status === 'Completed').length}
          </p>
          <p className="mt-1 text-[11px] text-muted">Client discovery & product demos</p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold text-muted">Conversion Win Rate</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {leads.length > 0
              ? `${Math.round(
                  (leads.filter((l) => l.status === 'Completed').length / leads.length) * 100,
                )}%`
              : '0%'}
          </p>
          <p className="mt-1 text-[11px] text-muted">Closed deals out of total leads</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Industry Pipeline Value */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy dark:text-white mb-4">
            Pipeline Value by Industry (₹)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="industry" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Value']}
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface))',
                    borderColor: 'rgb(var(--line))',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Bar */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy dark:text-white mb-4">
            Lead Inflow by Source Channel
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={11} />
                <YAxis dataKey="source" type="category" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface))',
                    borderColor: 'rgb(var(--line))',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
