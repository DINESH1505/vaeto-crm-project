import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LeadForm } from '../../components/leads/LeadForm';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { LeadInput, NextFollowUpInput } from '../../context/DataContext';

export default function EditLead() {
  const { id } = useParams<{ id: string }>();
  const { leads, updateLead } = useData();
  const toast = useToast();
  const navigate = useNavigate();

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-bold text-ink">Lead not found</p>
        <button
          onClick={() => navigate('/leads')}
          className="mt-3 text-xs font-semibold text-brand-600 hover:underline"
        >
          Back to all leads
        </button>
      </div>
    );
  }

  const handleUpdate = (patch: LeadInput, nextFollowUp?: NextFollowUpInput) => {
    updateLead(lead.id, patch, nextFollowUp);
    toast.success(`Lead "${patch.company}" updated.`);
    navigate(`/leads/${lead.id}`);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-line bg-surface p-2 text-muted hover:bg-soft hover:text-ink transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white">
            Edit Lead: {lead.company}
          </h1>
          <p className="text-xs text-muted">Update details, status, or scheduled touchpoints.</p>
        </div>
      </div>

      <LeadForm initialLead={lead} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}
