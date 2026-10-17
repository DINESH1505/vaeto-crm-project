import { CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useMyNotifications } from '../../hooks/useMyNotifications';
import { formatDateTime } from '../../utils/date';

export default function Notifications() {
  const { items, unread } = useMyNotifications();
  const { markNotificationsRead, deleteNotifications } = useData();

  const handleMarkAllRead = () => {
    markNotificationsRead(items.map((n) => n.id));
  };

  const handleClearAll = () => {
    deleteNotifications(items.map((n) => n.id));
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
            Notifications
          </h1>
          <p className="text-xs text-muted">
            Alerts for incoming leads, upcoming follow-ups, and calendar meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unread === 0}
            leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
          >
            Mark All Read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={items.length === 0}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card p-12 text-center text-xs text-muted">No notifications right now.</div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start justify-between gap-4 p-4 transition ${
                !n.read ? 'border-brand-300/80 bg-brand-50/20 dark:bg-brand-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    !n.read ? 'bg-brand-500' : 'bg-transparent'
                  }`}
                />
                <div>
                  <h3 className="text-sm font-bold text-ink">{n.title}</h3>
                  <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                  <span className="mt-1 block text-[10px] text-muted">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markNotificationsRead([n.id])}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-soft transition"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
