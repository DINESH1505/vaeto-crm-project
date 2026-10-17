import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  Trash2,
} from 'lucide-react';
import { Avatar, Button, ConfirmDialog, PriorityBadge, StatusBadge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatDateTime } from '../../utils/date';
import { formatCurrency } from '../../utils/helpers';

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const { leads, followUps, deleteLeads, addLeadNote } = useData();
  const { isAdmin, can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [noteText, setNoteText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="card p-10 text-center">
        <p className="text-base font-bold text-ink">Lead not found</p>
        <p className="mt-1 text-xs text-muted">This lead may have been deleted or moved.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/leads')} className="mt-4">
          Back to Leads
        </Button>
      </div>
    );
  }

  const relatedFollowUps = followUps.filter((f) => f.leadId === lead.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addLeadNote(lead.id, noteText.trim());
    setNoteText('');
    toast.success('Note added to activity history');
  };

  const handleDeleteLead = () => {
    deleteLeads([lead.id]);
    toast.success(`Lead "${lead.company}" was deleted`);
    navigate('/leads');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="rounded-xl border border-line bg-surface p-2 text-muted hover:bg-soft hover:text-ink transition"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-navy dark:text-white sm:text-2xl">
                {lead.company}
              </h1>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
            <p className="text-xs text-muted">Lead ID: {lead.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {can('leads.edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/leads/${lead.id}/edit`)}
              leftIcon={<Pencil className="h-3.5 w-3.5" />}
            >
              Edit Lead
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Grid: 2 columns details & activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Lead Info Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <Avatar name={lead.company} size="lg" single />
              <div>
                <h3 className="font-bold text-navy dark:text-white">{lead.contactName}</h3>
                <p className="text-xs text-muted">{lead.company}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-ink">
                <Mail className="h-4 w-4 text-brand-500 shrink-0" />
                <a href={`mailto:${lead.email}`} className="truncate hover:underline">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-ink">
                <Phone className="h-4 w-4 text-brand-500 shrink-0" />
                <span>{lead.phone}</span>
              </div>
              {lead.website && (
                <div className="flex items-center gap-2.5 text-ink">
                  <Globe className="h-4 w-4 text-brand-500 shrink-0" />
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {lead.website}
                  </a>
                </div>
              )}
              {lead.address && (
                <div className="flex items-center gap-2.5 text-ink">
                  <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
                  <span>{lead.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-ink">
                <Building className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Industry: {lead.industry}</span>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-soft/50 p-3">
              <p className="text-[11px] font-semibold text-muted">Estimated Deal Value</p>
              <p className="text-lg font-black text-brand-700 dark:text-brand-300">
                {formatCurrency(lead.dealValue)}
              </p>
            </div>
          </div>

          {/* Quick Schedule Follow-up */}
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Follow-ups ({relatedFollowUps.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/follow-ups')}
                className="text-xs h-7 px-2"
              >
                Manage
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {relatedFollowUps.length === 0 ? (
                <p className="text-xs text-muted py-2">No follow-ups recorded.</p>
              ) : (
                relatedFollowUps.map((f) => (
                  <div key={f.id} className="rounded-lg border border-line p-2 text-xs">
                    <div className="flex justify-between items-center font-semibold">
                      <span>{f.title}</span>
                      <span className="text-[10px] text-muted">{f.status}</span>
                    </div>
                    <p className="text-muted mt-0.5">
                      {formatDate(f.date)} at {f.time} ({f.type})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Activity Log and Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Add a quick note */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-navy dark:text-white">Add Activity Note</h3>
            <form onSubmit={handleAddNote} className="mt-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log a call, email exchange, or meeting summary..."
                className="input-base min-h-[80px] text-xs"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  rightIcon={<Send className="h-3.5 w-3.5" />}
                  disabled={!noteText.trim()}
                >
                  Post Note
                </Button>
              </div>
            </form>
          </div>

          {/* Activity Timeline */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-navy dark:text-white border-b border-line pb-3">
              Activity History & Timeline
            </h3>

            <div className="mt-4 space-y-4">
              {lead.activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                  <div className="flex-1 rounded-xl border border-line bg-surface p-3">
                    <div className="flex items-center justify-between text-muted text-[11px]">
                      <span className="font-bold text-ink">{act.by}</span>
                      <span>{formatDateTime(act.at)}</span>
                    </div>
                    <p className="mt-1 text-ink">{act.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to permanently delete ${lead.company}?`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDeleteLead}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}
