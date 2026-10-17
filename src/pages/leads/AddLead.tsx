import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LeadForm } from '../../components/leads/LeadForm';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { LeadInput, NextFollowUpInput } from '../../context/DataContext';

export default function AddLead() {
  const { addLead } = useData();
  const toast = useToast();
  const navigate = useNavigate();

  const handleCreate = (input: LeadInput, nextFollowUp?: NextFollowUpInput) => {
    const newLead = addLead(input, nextFollowUp);
    toast.success(`Lead "${newLead.company}" created successfully!`);
    navigate(`/leads/${newLead.id}`);
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
          <h1 className="text-xl font-extrabold text-navy dark:text-white">Add New Lead</h1>
          <p className="text-xs text-muted">Create a new potential client record in your pipeline.</p>
        </div>
      </div>

      <LeadForm onSubmit={handleCreate} submitLabel="Create Lead" />
    </div>
  );
}
