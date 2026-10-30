import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { Button, ConfirmDialog } from '../components/ui';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Meeting, MeetingStatus } from '../types';
import { dayNumber, formatTime, monthLong, monthMatrix, monthShort, toISODate } from '../utils/date';

export default function Calendar() {
  const { meetings, followUps, leads, updateMeeting, deleteMeeting } = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetingFilter, setMeetingFilter] = useState<'All' | MeetingStatus>('All');
  const [meetingToReopen, setMeetingToReopen] = useState<Meeting | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = monthMatrix(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const leadMap = new Map(leads.map((l) => [l.id, l]));

  const filteredMeetings = Array.from(
    new Map(
      meetings
        .filter((m) => {
          if (meetingFilter === 'All') return true;
          return m.status === meetingFilter;
        })
        .map((m) => [m.id, m])
    ).values()
  );

  const handleToggleComplete = async (m: Meeting) => {
    if (isUpdating) return;

    if (m.status === 'Completed') {
      setMeetingToReopen(m);
    } else {
      try {
        setIsUpdating(true);
        await updateMeeting(m.id, { status: 'Completed' });
        toast.success('Meeting marked as completed');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleConfirmReopen = async () => {
    if (!meetingToReopen || isUpdating) return;
    try {
      setIsUpdating(true);
      await updateMeeting(meetingToReopen.id, { status: 'Scheduled' });
      toast.success('Meeting marked as scheduled');
      setMeetingToReopen(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelMeeting = (m: Meeting) => {
    updateMeeting(m.id, { status: 'Cancelled' });
    toast.info('Meeting marked as cancelled');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
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

      {/* Month Navigator & Calendar Grid */}
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

            const dayMeetings = Array.from(
              new Map(meetings.filter((m) => m.date === iso && m.status !== 'Cancelled').map((m) => [m.id, m])).values()
            );
            const dayFollowUps = Array.from(
              new Map(followUps.filter((f) => f.date === iso && f.status === 'Pending').map((f) => [f.id, f])).values()
            );

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
                  {dayMeetings.map((m) => {
                    const isCompleted = m.status === 'Completed';
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleToggleComplete(m)}
                        className={`cursor-pointer truncate rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 line-through opacity-75 dark:bg-emerald-500/15 dark:text-emerald-300'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300'
                        }`}
                        title={`${m.title} at ${formatTime(m.time)} (${m.status}) - Click to toggle completion`}
                      >
                        {formatTime(m.time)} {m.title}
                      </div>
                    );
                  })}

                  {dayFollowUps.map((f) => (
                    <div
                      key={f.id}
                      className="truncate rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      title={`Follow-up: ${f.title} at ${formatTime(f.time)}`}
                    >
                      {formatTime(f.time)} {f.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Meetings List with Mark as Completed action */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-line pb-3">
          <div>
            <h3 className="text-sm font-bold text-navy dark:text-white">Meetings & Appointments</h3>
            <p className="text-xs text-muted">Manage scheduled sessions and mark them as completed.</p>
          </div>

          <div className="flex gap-1.5">
            {(['All', 'Scheduled', 'Completed', 'Cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMeetingFilter(tab)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  meetingFilter === tab
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredMeetings.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No meetings found in this view.
            </div>
          ) : (
            filteredMeetings.map((m) => {
              const lead = leadMap.get(m.leadId);
              const isCompleted = m.status === 'Completed';
              const isCancelled = m.status === 'Cancelled';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 transition sm:flex-row sm:items-center sm:justify-between hover:border-brand-200 ${
                    isCompleted ? 'bg-soft/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Date badge */}
                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-soft text-ink">
                      <span className="text-sm font-black leading-none">{dayNumber(m.date)}</span>
                      <span className="text-[10px] font-semibold uppercase leading-none text-muted">
                        {monthShort(m.date)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">{m.title}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                              : isCancelled
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[11px] text-muted">
                        {formatTime(m.time)} ({m.durationMins}m) · {m.mode} · Lead:{' '}
                        <strong>{lead ? `${lead.company} (${lead.contactName})` : m.leadId || 'General'}</strong>
                      </p>

                      {m.notes && (
                        <p className="mt-1 text-[11px] text-muted line-clamp-1 italic">
                          {m.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(m)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                      }`}
                      title={isCompleted ? 'Reopen meeting' : 'Mark as completed'}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {isCompleted ? 'Completed' : 'Mark Completed'}
                    </button>

                    {!isCancelled && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleCancelMeeting(m)}
                        className="rounded-lg p-1.5 text-muted hover:bg-soft hover:text-rose-600 transition"
                        title="Cancel meeting"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteMeeting(m.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600 transition dark:hover:bg-rose-500/10"
                      title="Delete meeting"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!meetingToReopen}
        title="Mark Meeting as Scheduled"
        message="Do you want to mark this meeting as Scheduled again?"
        confirmLabel="Confirm"
        tone="primary"
        loading={isUpdating}
        onConfirm={handleConfirmReopen}
        onCancel={() => {
          if (!isUpdating) setMeetingToReopen(null);
        }}
      />
    </div>
  );
}
