import { useState } from 'react';
import { CalendarCheck, Check, Clock, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Select } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { FollowUp, FollowUpStatus, FollowUpType } from '../types';
import { formatDate } from '../utils/date';

export default function FollowUps() {
  const { followUps, leads, addFollowUp, updateFollowUp, deleteFollowUp } = useData();
  const { user } = useAuth();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | FollowUpStatus>('Pending');

  // Form state
  const [leadId, setLeadId] = useState(leads[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<FollowUpType>('Call');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('11:00');
  const [notes, setNotes] = useState('');

  const leadOptions = leads.map((l) => ({ value: l.id, label: `${l.company} (${l.contactName})` }));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    addFollowUp({
      leadId,
      title: title.trim(),
      type,
      date,
      time,
      notes: notes.trim(),
      status: 'Pending',
      ownerId: user?.id || 'u_dinesh',
    });

    toast.success('Follow-up scheduled');
    setModalOpen(false);
    setTitle('');
  };

  const handleMarkDone = (f: FollowUp) => {
    updateFollowUp(f.id, { status: f.status === 'Done' ? 'Pending' : 'Done' });
    toast.success(f.status === 'Done' ? 'Marked as Pending' : 'Follow-up marked as Completed');
  };

  const filtered = followUps.filter((f) => {
    if (filter === 'All') return true;
    return f.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
            Follow-up Management
          </h1>
          <p className="text-xs text-muted">Keep your commitments on track and never lose a deal.</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Schedule Follow-up
        </Button>
      </div>

      <div className="flex gap-2 border-b border-line pb-2">
        {(['Pending', 'Done', 'All'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === tab
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center text-xs text-muted">No follow-ups in this view.</div>
        ) : (
          filtered.map((f) => {
            const lead = leads.find((l) => l.id === f.leadId);
            const isDone = f.status === 'Done';

            return (
              <div
                key={f.id}
                className="card flex items-center justify-between gap-4 p-4 transition hover:border-brand-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-brand-600 dark:text-brand-300">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold text-ink ${isDone ? 'line-through text-muted' : ''}`}>
                      {f.title}
                    </h3>
                    <p className="text-xs text-muted">
                      Lead: <span className="font-semibold text-ink">{lead?.company || 'General'}</span> (
                      {lead?.contactName})
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(f.date)} at {f.time}</span>
                      <span className="rounded bg-soft px-1.5 py-0.2 text-[10px] font-semibold text-ink">
                        {f.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isDone ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => handleMarkDone(f)}
                    leftIcon={<Check className="h-3.5 w-3.5" />}
                  >
                    {isDone ? 'Reopen' : 'Complete'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => deleteFollowUp(f.id)}
                    className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-500 transition"
                    title="Delete follow-up"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule New Follow-up">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Target Lead"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={leadOptions}
            required
          />
          <Input
            label="Follow-up Title"
            placeholder="e.g. Proposal review call"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as FollowUpType)}
              options={['Call', 'Email', 'Meeting', 'Demo', 'WhatsApp']}
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <Input
            label="Notes"
            placeholder="Talking points, context, or agenda"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Follow-up
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
