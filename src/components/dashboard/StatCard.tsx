import { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: number;
  trend: number | string;
  spark: number[];
  icon: ReactNode;
  iconBg?: string;
  lineColor?: string;
  subInfo?: ReactNode;
}

export function StatCard({
  title,
  value,
  trend,
  spark,
  icon,
  iconBg = 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  lineColor = '#8b5cf6',
  subInfo,
}: StatCardProps) {
  const chartData = spark.map((val, idx) => ({ idx, val }));

  return (
    <div className="card flex flex-col justify-between p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{title}</span>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', iconBg)}>
          {icon}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-black tracking-tight text-navy dark:text-white sm:text-3xl">
            {value}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            <span>{typeof trend === 'number' ? (trend >= 0 ? `+${trend}%` : `${trend}%`) : trend}</span>
            <span className="text-muted font-normal">vs last week</span>
          </div>
          {subInfo && (
            <div className="mt-1 text-[11px] font-medium text-muted">
              {subInfo}
            </div>
          )}
        </div>

        {/* Mini sparkline chart matching reference */}
        <div className="h-10 w-20 sm:w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="val"
                stroke={lineColor}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
