import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../components/ui';
import { useData } from '../context/DataContext';
import { monthLong, monthMatrix, toISODate } from '../utils/date';

export default function Calendar() {
  const { meetings, followUps } = useData();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = monthMatrix(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
            Calendar & Schedule
          </h1>
          <p className="text-xs text-muted">
            All meetings, product demos, and client follow-ups across your team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/meetings/new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy dark:text-white">
            {monthLong(month)} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="rounded-lg p-2 text-muted hover:bg-soft hover:text-ink transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg p-2 text-muted hover:bg-soft hover:text-ink transition"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 7 Columns Grid */}
        <div className="mt-4 grid grid-cols-7 gap-px rounded-xl border border-line bg-line overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="bg-surface py-2 text-center text-xs font-bold text-muted"
            >
              {d}
            </div>
          ))}

          {days.map((dayDate, idx) => {
            const iso = toISODate(dayDate);
            const isCurrentMonth = dayDate.getMonth() === month;
            const isToday = toISODate(new Date()) === iso;

            const dayMeetings = meetings.filter((m) => m.date === iso && m.status !== 'Cancelled');
            const dayFollowUps = followUps.filter((f) => f.date === iso && f.status === 'Pending');

            return (
              <div
                key={idx}
                className={`min-h-[90px] bg-surface p-1.5 transition ${
                  isCurrentMonth ? '' : 'bg-soft/30 opacity-40'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${
                      isToday
                        ? 'bg-brand-gradient text-white'
                        : isCurrentMonth
                        ? 'text-ink'
                        : 'text-muted'
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                </div>

                <div className="mt-1 space-y-1">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="truncate rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      title={`${m.title} at ${m.time}`}
                    >
                      {m.time} {m.title}
                    </div>
                  ))}

                  {dayFollowUps.map((f) => (
                    <div
                      key={f.id}
                      className="truncate rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      title={`Follow-up: ${f.title} at ${f.time}`}
                    >
                      {f.time} {f.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
