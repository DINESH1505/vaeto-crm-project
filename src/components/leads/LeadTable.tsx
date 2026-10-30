import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Avatar, Checkbox, Pagination, StatusBadge } from '../ui';
import { FollowUp, Lead, Meeting } from '../../types';
import { formatDate, formatTime } from '../../utils/date';

interface LeadTableProps {
  leads: Lead[];
  followUpMap?: Map<string, FollowUp>;
  meetingMap?: Map<string, Meeting>;
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
  meetingMap,
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLeads = leads.slice(startIndex, startIndex + pageSize);

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedIds.includes(l.id));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[1400px]">
          <thead className="border-b border-line bg-soft/40 text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr>
              <th className="py-3 pl-4 pr-3 text-left whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Select all leads"
                  />
                  <span>S.NO</span>
                </div>
              </th>
              <th className="py-3 px-3 text-left whitespace-nowrap">COMPANY NAME</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">PERSON NAME</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">TITLE</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">EMAIL</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">PHONE NUMBER</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">CORPORATE PHONE</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">WHAT'S APP NUMBER</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">COMPLETE ON</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">MEETING DATE</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">MEETING TIME</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">LAST CONTACTED</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">STATUS</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">COMMENT</th>
              <th className="py-3 px-3 text-left whitespace-nowrap">FOLLOW-UPS</th>
              <th className="py-3 pr-4 pl-3 text-right whitespace-nowrap">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-900/30">
                      <svg
                        className="h-7 w-7 text-indigo-500 dark:text-indigo-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M7 8h10" />
                        <path d="M7 12h10" />
                        <path d="M7 16h6" />
                      </svg>
                    </div>
                    <h4 className="mt-4 text-base font-bold text-navy dark:text-white">
                      {leads.length === 0 ? 'No leads yet.' : 'No leads found.'}
                    </h4>
                    <p className="mt-1 text-xs text-muted">
                      {leads.length === 0
                        ? 'Import your leads from Excel to get started.'
                        : 'No leads found matching your criteria.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead, idx) => {
                const isSelected = selectedIds.includes(lead.id);
                const nextFollowUp = followUpMap?.get(String(lead.id));
                const nextMeeting = meetingMap?.get(String(lead.id));
                const displayMeetingDate = nextMeeting?.date || lead.meetingDate;
                const displayMeetingTime = nextMeeting?.time || lead.meetingTime;

                return (
                  <tr
                    key={lead.id}
                    className={`transition hover:bg-soft/50 ${isSelected ? 'bg-brand-50/50 dark:bg-brand-500/10' : ''}`}
                  >
                    <td className="py-3.5 pl-4 pr-3 whitespace-nowrap text-muted font-medium">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onToggleSelect?.(lead.id)}
                          aria-label={`Select ${lead.company}`}
                        />
                        <span>{startIndex + idx + 1}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar name={lead.company} size="xs" single />
                        <span className="font-bold text-navy dark:text-white">{lead.company}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-ink whitespace-nowrap">{lead.contactName || '-'}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">{lead.title || '-'}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">{lead.email || '-'}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">{lead.phone || '-'}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">{lead.corporatePhone || '-'}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">{lead.whatsappNumber || '-'}</td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {lead.completedOn ? formatDate(lead.completedOn, 'DD/MM/YYYY') : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {displayMeetingDate ? formatDate(displayMeetingDate) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {displayMeetingTime ? formatTime(displayMeetingTime) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {lead.lastContact ? formatDate(lead.lastContact) : '-'}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3.5 px-3 text-muted max-w-[150px] truncate" title={lead.comments}>
                      {lead.comments || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-muted whitespace-nowrap">
                      {nextFollowUp ? formatDate(nextFollowUp.date) : '-'}
                    </td>
                    <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
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
