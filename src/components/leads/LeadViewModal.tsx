import {
  Briefcase,
  Calendar,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import { Avatar, Button, Modal, PriorityBadge, StatusBadge } from '../ui';
import { FollowUp, Lead, User } from '../../types';
import { formatDate, formatDateTime } from '../../utils/date';
import { formatCurrency } from '../../utils/helpers';

interface LeadViewModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  nextFollowUp?: FollowUp;
  owner?: User;
}

export function LeadViewModal({
  lead,
  open,
  onClose,
  nextFollowUp,
  owner,
}: LeadViewModalProps) {
  if (!lead) return null;

  const websiteUrl = lead.website
    ? lead.website.startsWith('http://') || lead.website.startsWith('https://')
      ? lead.website
      : `https://${lead.website}`
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lead Details"
      description="Read-only view of complete pipeline lead record."
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose} autoFocus>
          Close
        </Button>
      }
    >
      <div className="space-y-6 py-1">
        {/* Header Summary Banner */}
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={lead.company} size="lg" single />
            <div>
              <h3 className="text-base font-extrabold text-navy dark:text-white">
                {lead.company}
              </h3>
              <p className="text-xs text-muted">Contact: {lead.contactName}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {formatCurrency(lead.dealValue)}
            </span>
          </div>
        </div>

        {/* 2-Column Grid of Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Section 1: Contact Information */}
          <div className="space-y-3 rounded-xl border border-line p-4">
            <div className="flex items-center gap-2 border-b border-line pb-2">
              <UserIcon className="h-4 w-4 text-brand-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Contact Information
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-muted block text-[11px]">Contact Person</span>
                <span className="font-semibold text-ink">{lead.contactName || '—'}</span>
              </div>

              <div>
                <span className="text-muted block text-[11px]">Email Address</span>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1.5 font-medium text-brand-600 hover:underline break-all"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </div>

              <div>
                <span className="text-muted block text-[11px]">Contact Number</span>
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </div>

              {websiteUrl && (
                <div>
                  <span className="text-muted block text-[11px]">Website</span>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-medium text-brand-600 hover:underline break-all"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    {lead.website}
                  </a>
                </div>
              )}

              {lead.address && (
                <div>
                  <span className="text-muted block text-[11px]">Address</span>
                  <span className="flex items-start gap-1.5 text-ink">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted" />
                    {lead.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Pipeline & Business Details */}
          <div className="space-y-3 rounded-xl border border-line p-4">
            <div className="flex items-center gap-2 border-b border-line pb-2">
              <Briefcase className="h-4 w-4 text-brand-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Pipeline Details
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px]">Lead Status:</span>
                <StatusBadge status={lead.status} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px]">Priority:</span>
                <PriorityBadge priority={lead.priority} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px]">Estimated Value:</span>
                <span className="font-bold text-ink">{formatCurrency(lead.dealValue)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px]">Industry:</span>
                <span className="font-semibold text-ink">{lead.industry || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px]">Lead Source:</span>
                <span className="font-semibold text-ink">{lead.source || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px]">Assigned Owner:</span>
                <span className="font-semibold text-ink">{owner?.name || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Schedule & Timeline */}
        <div className="space-y-3 rounded-xl border border-line p-4">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <Calendar className="h-4 w-4 text-brand-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              Schedule & Activity
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
            <div className="rounded-lg bg-soft/50 p-2.5">
              <span className="text-muted block text-[11px]">Completed / Meeting Date</span>
              <span className="font-bold text-ink">
                {lead.meetingDate ? formatDate(lead.meetingDate) : '—'}
              </span>
            </div>

            <div className="rounded-lg bg-soft/50 p-2.5">
              <span className="text-muted block text-[11px]">Meeting Time</span>
              <span className="font-bold text-ink">
                {lead.meetingTime || '—'}
              </span>
            </div>

            <div className="rounded-lg bg-soft/50 p-2.5">
              <span className="text-muted block text-[11px]">Last Connect</span>
              <span className="font-bold text-ink">
                {lead.lastContact ? formatDate(lead.lastContact) : '—'}
              </span>
            </div>

            <div className="rounded-lg bg-soft/50 p-2.5">
              <span className="text-muted block text-[11px]">Next Follow-up</span>
              <span className="font-bold text-ink">
                {nextFollowUp
                  ? `${formatDate(nextFollowUp.date)}${nextFollowUp.time ? ` at ${nextFollowUp.time}` : ''}`
                  : '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-muted pt-1">
            <span>
              <strong>Created:</strong> {lead.createdAt ? formatDateTime(lead.createdAt) : '—'}
            </span>
            <span>
              <strong>Last Updated:</strong> {lead.updatedAt ? formatDateTime(lead.updatedAt) : '—'}
            </span>
          </div>
        </div>

        {/* Section 4: Full Comments / Notes */}
        <div className="space-y-2 rounded-xl border border-line p-4">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <FileText className="h-4 w-4 text-brand-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              Comments & Notes
            </h4>
          </div>

          {lead.comments ? (
            <p className="whitespace-pre-wrap rounded-lg bg-soft/40 p-3 text-xs leading-relaxed text-ink">
              {lead.comments}
            </p>
          ) : (
            <p className="text-xs italic text-muted">No comments or notes provided for this lead.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
