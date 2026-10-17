import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { FollowUp, Lead } from '../../types';
import { dayNumber, monthShort } from '../../utils/date';

interface UpcomingFollowUpsProps {
  followUps: FollowUp[];
  leads: Lead[];
}

export function UpcomingFollowUps({ followUps, leads }: UpcomingFollowUpsProps) {
  const navigate = useNavigate();
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  // Sort upcoming pending follow-ups
  const sorted = [...followUps]
    .filter((f) => f.status === 'Pending')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  const colors = [
    'border-emerald-400 bg-emerald-400',
    'border-sky-400 bg-sky-400',
    'border-amber-400 bg-amber-400',
    'border-purple-400 bg-purple-400',
    'border-pink-400 bg-pink-400',
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy dark:text-white">Upcoming Follow-ups</h3>
        <Link
          to="/follow-ups"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">No upcoming follow-ups scheduled.</p>
        ) : (
          sorted.map((item, idx) => {
            const lead = leadMap.get(item.leadId);
            const dotColor = colors[idx % colors.length];

            return (
              <div
                key={item.id}
                onClick={() => navigate(lead ? `/leads/${lead.id}` : '/follow-ups')}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface p-2.5 transition hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* Date badge */}
                  <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-soft text-ink">
                    <span className="text-sm font-black leading-none">{dayNumber(item.date)}</span>
                    <span className="text-[10px] font-semibold uppercase leading-none text-muted">
                      {monthShort(item.date)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                      <p className="truncate text-xs font-bold text-ink">
                        {lead ? `${lead.company} – ${lead.contactName}` : item.title}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {item.time} – {item.title}
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
