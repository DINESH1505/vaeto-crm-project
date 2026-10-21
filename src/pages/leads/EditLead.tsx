import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LeadForm } from '../../components/leads/LeadForm';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { LeadInput, NextFollowUpInput } from '../../context/DataContext';

import { useState } from 'react';

export default function EditLead() {
  const { id } = useParams<{ id: string }>();
  const { leads, updateLead, refreshLeads } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const handleUpdate = async (patch: LeadInput, nextFollowUp?: NextFollowUpInput) => {
    try {
      setLoading(true);
      await updateLead(lead.id, patch, nextFollowUp);
      await refreshLeads();
      toast.success(`Lead "${patch.company}" updated successfully.`);
      navigate(`/leads/${lead.id}`);
    } catch (err: any) {
      console.error('Failed to update lead:', err);
      toast.error(err?.message || 'Failed to update lead in database.');
    } finally {
      setLoading(false);
    }
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

      <LeadForm initialLead={lead} onSubmit={handleUpdate} submitLabel="Save Changes" loading={loading} />
    </div>
  );
}
