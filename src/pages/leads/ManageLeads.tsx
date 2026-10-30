import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Download,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { LeadTable } from '../../components/leads/LeadTable';
import { LeadViewModal } from '../../components/leads/LeadViewModal';
import { ImportLeadsModal } from '../../components/leads/ImportLeadsModal';
import { Button, ConfirmDialog } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { downloadFile, toCSV } from '../../utils/helpers';
import { formatDate } from '../../utils/date';
import { nextFollowUpMap, nextMeetingMap } from '../../utils/stats';
import { LEAD_STATUSES, Lead } from '../../types';

export default function ManageLeads() {
  const [params] = useSearchParams();
  const initialQuery = params.get('q') || '';
  const initialStatus = params.get('status') || 'All';

  const { leads, followUps, meetings, deleteLeads, refreshLeads, users } = useData();
  const { isAdmin, can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [selectedLeadForView, setSelectedLeadForView] = useState<Lead | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    refreshLeads();
  }, [refreshLeads]);

  const followUpMap = useMemo(() => nextFollowUpMap(followUps), [followUps]);
  const meetingMap = useMemo(() => nextMeetingMap(meetings), [meetings]);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.contactName && lead.contactName.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.corporatePhone && lead.corporatePhone.toLowerCase().includes(q)) ||
        (lead.whatsappNumber && lead.whatsappNumber.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || lead.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [leads, search, statusFilter, priorityFilter]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((l) => l.id));
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((l, index) => ({
      'S.NO': index + 1,
      'COMPANY NAME': l.company,
      'PERSON NAME': l.contactName,
      'TITLE': l.title || '',
      'EMAIL': l.email || '',
      'PHONE NUMBER': l.phone || '',
      'CORPORATE PHONE': l.corporatePhone || '',
      "WHAT'S APP NUMBER": l.whatsappNumber || '',
      'COMPLETE ON': l.completedOn ? formatDate(l.completedOn, 'DD/MM/YYYY') : '',
      'MEETING DATE': l.meetingDate || '',
      'MEETING TIME': l.meetingTime || '',
      'LAST CONTACTED': l.lastContact || '',
      'STATUS': l.status || 'New',
      'COMMENT': l.comments || '',
      'FOLLOW-UPS': followUpMap?.get(l.id)?.date || '',
    }));
    const csv = toCSV(rows);
    downloadFile(`leads_export_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv');
    toast.success('Leads exported as CSV');
  };

  const handleSingleDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLeads([leadToDelete.id]);
      await refreshLeads();
      toast.success(`Lead "${leadToDelete.company}" deleted.`);
    } catch (err: any) {
      console.error('Failed to delete lead:', err);
      toast.error(err?.message || 'Failed to delete lead in database.');
    } finally {
      setLeadToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteLeads(selectedIds);
      await refreshLeads();
      toast.success(`${selectedIds.length} leads deleted.`);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to delete leads:', err);
      toast.error(err?.message || 'Failed to delete leads in database.');
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
            Manage Leads
          </h1>
          <p className="text-xs text-muted">
            View, filter, edit, and organize all pipeline prospects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {can('leads.create') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              leftIcon={<Upload className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
            >
              Import Leads
            </Button>
          )}

          {can('leads.export') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export CSV
            </Button>
          )}

          {can('leads.create') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/leads/new')}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add New Lead
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by company, person name, email, or contact number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base w-auto text-xs py-2"
            >
              <option value="All">All Statuses</option>
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-base w-auto text-xs py-2"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {selectedIds.length > 0 && isAdmin && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setBulkDeleteConfirm(true)}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden">
        <LeadTable
          leads={filtered}
          followUpMap={followUpMap}
          meetingMap={meetingMap}
          isAdmin={isAdmin}
          onView={(lead) => setSelectedLeadForView(lead)}
          onDelete={(lead) => setLeadToDelete(lead)}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          pageSize={10}
        />
      </div>

      {/* Read-Only Lead Details Modal */}
      <LeadViewModal
        lead={selectedLeadForView}
        open={!!selectedLeadForView}
        onClose={() => setSelectedLeadForView(null)}
        nextFollowUp={selectedLeadForView ? followUpMap.get(selectedLeadForView.id) : undefined}
        owner={selectedLeadForView ? users.find((u) => u.id === selectedLeadForView.ownerId) : undefined}
      />

      {/* Single Delete Dialog */}
      <ConfirmDialog
        open={!!leadToDelete}
        title="Delete Lead"
        message={
          <>
            Are you sure you want to permanently delete lead{' '}
            <strong>{leadToDelete?.company}</strong>?
          </>
        }
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleSingleDelete}
        onCancel={() => setLeadToDelete(null)}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        title="Delete Selected Leads"
        message={`Are you sure you want to permanently delete all ${selectedIds.length} selected leads?`}
        confirmLabel="Delete All Selected"
        tone="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />

      {/* Bulk Import Leads Modal */}
      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={refreshLeads}
      />
    </div>
  );
}
