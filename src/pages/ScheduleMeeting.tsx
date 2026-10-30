import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button, Input, Select, Textarea } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { MeetingMode } from '../types';
import { todayISO } from '../utils/date';

export default function ScheduleMeeting() {
  const { leads, addMeeting } = useData();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryLeadId = searchParams.get('leadId');

  const [leadId, setLeadId] = useState(queryLeadId || leads[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('11:00');
  const [durationMins, setDurationMins] = useState('30');
  const [mode, setMode] = useState<MeetingMode>('Online');
  const [location, setLocation] = useState('Google Meet');
  const [attendees, setAttendees] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (queryLeadId) {
      setLeadId(queryLeadId);
    } else if (!leadId && leads.length > 0) {
      setLeadId(leads[0].id);
    }
  }, [leads, leadId, queryLeadId]);

  const leadOptions = leads.map((l) => ({ value: l.id, label: `${l.company} (${l.contactName})` }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim() || !date) return;

    try {
      setIsSubmitting(true);
      const chosenLeadId = leadId || leads[0]?.id || '';
      await addMeeting({
        leadId: chosenLeadId,
        title: title.trim(),
        date,
        time,
        durationMins: parseInt(durationMins, 10) || 30,
        mode,
        location,
        attendees,
        notes,
        status: 'Scheduled',
        ownerId: user?.id || '1',
      });

      toast.success('Meeting scheduled and added to calendar');
      navigate('/calendar');
    } catch (err) {
      toast.error('Failed to schedule meeting');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-line bg-surface p-2 text-muted hover:bg-soft hover:text-ink transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white">Schedule Meeting</h1>
          <p className="text-xs text-muted">Book a client presentation, product demo, or review.</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Prospect / Client Lead"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={leadOptions}
            required
          />

          <Input
            label="Meeting Title"
            placeholder="e.g. VaetoTech Demo & Technical Architecture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Meeting Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Select
              label="Duration"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
              options={[
                { value: '15', label: '15 mins' },
                { value: '30', label: '30 mins' },
                { value: '45', label: '45 mins' },
                { value: '60', label: '60 mins' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Meeting Channel"
              value={mode}
              onChange={(e) => {
                const nextMode = e.target.value as MeetingMode;
                setMode(nextMode);
                if (nextMode === 'Online') setLocation('Google Meet');
                else if (nextMode === 'Phone') setLocation('Phone call');
                else setLocation('Client office');
              }}
              options={['Online', 'In Person', 'Phone']}
            />
            <Input
              label="Meeting Link / Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Input
            label="Attendees (comma-separated emails)"
            placeholder="e.g. rahul@abctech.com, manager@vaetotech.com"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />

          <Textarea
            label="Meeting Agenda & Preparation Notes"
            placeholder="Specify key objectives, deck links, and questions to ask..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => navigate(-1)} type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              leftIcon={<Calendar className="h-4 w-4" />}
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
