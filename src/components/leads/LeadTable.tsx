import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Avatar, Checkbox, Pagination, StatusBadge } from '../ui';
import { FollowUp, Lead } from '../../types';
import { formatDate } from '../../utils/date';

interface LeadTableProps {
  leads: Lead[];
  followUpMap?: Map<string, FollowUp>;
  onView?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  isAdmin?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  pageSize?: number;
}

export function LeadTable({
  leads,
  followUpMap,
  onView,
  onEdit,
  onDelete,
  isAdmin = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  pageSize = 9,
}: LeadTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const total = leads.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLeads = leads.slice(startIndex, startIndex + pageSize);

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedIds.includes(l.id));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-soft/40 text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr>
              <th className="py-3 pl-4 pr-2">
                <Checkbox
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all leads"
                />
              </th>
              <th className="py-3 px-3">Company Name</th>
              <th className="py-3 px-3">Person Name</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Completed On</th>
              <th className="py-3 px-3">Meeting Time</th>
              <th className="py-3 px-3">Last Connect</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Comments</th>
              <th className="py-3 px-3">Next Follow-up</th>
              <th className="py-3 pr-4 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-xs text-muted">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                const nextFollowUp = followUpMap?.get(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`transition hover:bg-soft/50 ${isSelected ? 'bg-brand-50/50 dark:bg-brand-500/10' : ''}`}
                  >
                    <td className="py-3.5 pl-4 pr-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(lead.id)}
                        aria-label={`Select ${lead.company}`}
                      />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={lead.company} size="xs" single />
                        <span className="font-bold text-navy dark:text-white">{lead.company}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-ink">{lead.contactName}</td>
                    <td className="py-3.5 px-3 text-muted">{lead.email}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">{lead.phone}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {lead.meetingDate ? formatDate(lead.meetingDate) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {lead.meetingTime || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {lead.lastContact ? formatDate(lead.lastContact) : '-'}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3.5 px-3 text-muted max-w-[150px] truncate" title={lead.comments}>
                      {lead.comments || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {nextFollowUp ? formatDate(nextFollowUp.date) : '-'}
                    </td>
                    <td className="py-3.5 pr-4 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => (onView ? onView(lead) : navigate(`/leads/${lead.id}`))}
                          className="rounded-lg p-1.5 text-muted hover:bg-soft hover:text-brand-600 transition"
                          title="View lead"
                          aria-label="View lead"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => (onEdit ? onEdit(lead) : navigate(`/leads/${lead.id}/edit`))}
                          className="rounded-lg p-1.5 text-muted hover:bg-soft hover:text-brand-600 transition"
                          title="Edit lead"
                          aria-label="Edit lead"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onDelete?.(lead)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                            title="Delete lead"
                            aria-label="Delete lead"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-line px-4 py-3">
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={total}
          onPageChange={setCurrentPage}
          label="leads"
        />
      </div>
    </div>
  );
}
