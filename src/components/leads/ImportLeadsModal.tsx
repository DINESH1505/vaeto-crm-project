import React, { useRef, useState } from 'react';
import {
  CloudUpload,
  Download,
  Upload,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { crmApi, BulkImportResult } from '../../api';
import { useToast } from '../../context/ToastContext';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedLeadRow {
  sNo?: number | string;
  company: string;
  contactName: string;
  title?: string;
  email?: string;
  phone?: string;
  corporatePhone?: string;
  whatsappNumber?: string;
  status?: string;
  completedOn?: string;
  meetingDate?: string;
  meetingTime?: string;
  lastContact?: string;
  priority?: string;
  industry?: string;
  source?: string;
  dealValue?: number;
  comments?: string;
  _rowNumber: number;
  _hasError?: boolean;
  _errorMsg?: string;
}

export function ImportLeadsModal({ isOpen, onClose, onSuccess }: ImportLeadsModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedLeadRow[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setImportResult(null);
    setIsImporting(false);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Helper to parse dates from Date objects, numbers, and date string formats
  const parseDateValue = (raw: any): string => {
    if (!raw && raw !== 0) return '';
    if (raw instanceof Date) {
      if (isNaN(raw.getTime())) return '';
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, '0');
      const d = String(raw.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof raw === 'number') {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const ms = raw * 86400 * 1000;
      const d = new Date(excelEpoch.getTime() + ms);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
      }
    }
    const str = String(raw).trim();
    if (!str || str === '-' || str.toLowerCase() === 'null') return '';

    // Match DD-MM-YYYY or DD/MM/YYYY
    const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyy) {
      const p1 = parseInt(ddmmyyyy[1], 10);
      const p2 = parseInt(ddmmyyyy[2], 10);
      const y = ddmmyyyy[3];
      if (p1 > 12) {
        return `${y}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
      }
      return `${y}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    }

    // Match YYYY-MM-DD
    const yyyymmdd = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (yyyymmdd) {
      return `${yyyymmdd[1]}-${String(yyyymmdd[2]).padStart(2, '0')}-${String(yyyymmdd[3]).padStart(2, '0')}`;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    return str;
  };

  // Helper to parse time values from Date objects, strings, or Excel decimals
  const parseTimeValue = (raw: any): string => {
    if (!raw && raw !== 0) return '';
    if (raw instanceof Date) {
      if (isNaN(raw.getTime())) return '';
      const hours = raw.getHours();
      const mins = String(raw.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      return `${h12}:${mins} ${ampm}`;
    }
    if (typeof raw === 'number' && raw >= 0 && raw < 1) {
      const totalSeconds = Math.round(raw * 86400);
      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      return `${h12}:${String(mins).padStart(2, '0')} ${ampm}`;
    }
    const str = String(raw).trim();
    if (!str || str === '-' || str.toLowerCase() === 'null') return '';
    return str;
  };

  // Helper to extract raw value matching header aliases
  const getFieldRaw = (row: any, ...keys: string[]): any => {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      const target = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = rowKeys.find(
        (rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === target
      );
      if (match && row[match] !== undefined && row[match] !== null) {
        return row[match];
      }
    }
    return undefined;
  };

  // Helper to map headers case-insensitively and space/symbol-insensitively
  const getField = (row: any, ...keys: string[]): string => {
    const val = getFieldRaw(row, ...keys);
    if (val === undefined || val === null) return '';
    if (val instanceof Date) {
      return parseDateValue(val);
    }
    return String(val).trim();
  };

  const processFile = async (file: File) => {
    const validExts = ['.xlsx', '.xls', '.csv'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExts.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      toast.error('Invalid file format. Please upload .xlsx, .xls, or .csv files.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        toast.error('The selected file contains no data rows.');
        setParsedRows([]);
        return;
      }

      const rows: ParsedLeadRow[] = rawJson.map((row, index) => {
        const sNoRaw = getField(row, 's.no', 'sno', 'sl no', 'sr no', 'serial no');
        const sNo = sNoRaw || (index + 1);

        const company = getField(row, 'company name', 'company', 'organization', 'business name');
        const contactName = getField(row, 'person name', 'contact person', 'contact name', 'name', 'lead name');
        const title = getField(row, 'title', 'job title', 'designation', 'position', 'role');
        const email = getField(row, 'email', 'email address', 'mail');
        // Contact number / mobile phone
        const phone = getField(row, 'contact number', 'mobile phone', 'mobile', 'phone', 'contact', 'phone number', 'cell', 'cellular');
        const corporatePhone = getField(row, 'corporate phone', 'corporate contact', 'office phone', 'work phone', 'landline', 'corporate');
        const whatsappNumber = getField(row, "what's app number", "whatsapp number", "whatsapp", "whats app", "wa number", "whatsapp no");

        // Complete On (Connected On)
        const completedOn = parseDateValue(getFieldRaw(row, 'complete on', 'completed on', 'complete date', 'completed date', 'connected on'));

        // Meeting Date
        const meetingDate = parseDateValue(getFieldRaw(row, 'meeting date', 'next follow up', 'next follow-up', 'follow up date', 'follow up', 'follow-up', 'next meeting'));

        // Meeting Time
        const meetingTime = parseTimeValue(getFieldRaw(row, 'meeting time', 'time', 'next meeting time'));

        // Last Connected (Last Contact)
        const lastContact = parseDateValue(getFieldRaw(row, 'last connected', 'last connect date', 'last contact', 'last contacted', 'last call'));

        // Status
        const status = getField(row, 'status', 'lead status') || 'New';

        // Comment (Singular & Plural)
        const comments = getField(row, 'comment', 'comments', 'notes', 'note', 'description', 'remarks');

        const priority = getField(row, 'priority') || 'Medium';
        const industry = getField(row, 'industry') || 'IT Services';
        const source = getField(row, 'source', 'lead source') || 'Website';
        const dealValRaw = getField(row, 'deal value', 'deal amount', 'value', 'amount');
        const dealValue = dealValRaw ? parseFloat(dealValRaw.replace(/[^0-9.]/g, '')) || 0 : 0;

        const errors: string[] = [];
        if (!company) errors.push('Missing company name');
        if (!contactName) errors.push('Missing person name');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push('Invalid email format');
        }

        return {
          sNo,
          company,
          contactName,
          title,
          email,
          phone,
          corporatePhone,
          whatsappNumber,
          status,
          completedOn,
          meetingDate,
          meetingTime,
          lastContact,
          priority,
          industry,
          source,
          dealValue,
          comments,
          _rowNumber: index + 1,
          _hasError: errors.length > 0,
          _errorMsg: errors.join(', '),
        };
      });

      setParsedRows(rows);
      toast.success(`Detected ${rows.length} leads from "${file.name}"`);
    } catch (err: any) {
      console.error('Failed to parse file:', err);
      toast.error('Failed to parse file. Please verify file integrity.');
      setSelectedFile(null);
      setParsedRows([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/leads/import/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vaeto_leads_template.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Excel template downloaded successfully');
        return;
      }
    } catch {
      // Fallback: generate template client-side via XLSX
    }

    // Client-side fallback generation
    const templateData = [
      {
        'S.NO': 1,
        'COMPANY NAME': 'Apex CyberTech Solutions',
        'PERSON NAME': 'Marcus Vance',
        'TITLE': 'CTO',
        'EMAIL': 'marcus.v@apextech.io',
        'MOBILE PHONE': '+1 (555) 234-5678',
        'CORPORATE PHONE': '+1 (555) 0199',
        "WHAT'S APP NUMBER": '+1 (555) 234-5678',
        'COMPLETE ON': '2026-10-20',
        'MEETING DATE': '2026-11-05',
        'MEETING TIME': '10:30 AM',
        'LAST CONNECTED': '2026-10-22',
        'STATUS': 'Pending',
        'COMMENT': 'Enterprise inquiry',
        'FOLLOW-UPS': '2026-11-05',
        'ACTION': 'Schedule Follow-up',
      },
      {
        'S.NO': 2,
        'COMPANY NAME': 'Novis Financial Systems',
        'PERSON NAME': 'Elena Rostova',
        'TITLE': 'Director of Operations',
        'EMAIL': 'erostova@novisfin.com',
        'MOBILE PHONE': '+1 (555) 987-6543',
        'CORPORATE PHONE': '+1 (555) 0188',
        "WHAT'S APP NUMBER": '+1 (555) 987-6543',
        'COMPLETE ON': '',
        'MEETING DATE': '2026-11-12',
        'MEETING TIME': '02:00 PM',
        'LAST CONNECTED': '2026-10-24',
        'STATUS': 'Negotiation',
        'COMMENT': 'Contract under review',
        'FOLLOW-UPS': '2026-11-12',
        'ACTION': 'Send Proposal',
      },
      {
        'S.NO': 3,
        'COMPANY NAME': 'Helios Health Dynamics',
        'PERSON NAME': 'Dr. Aris Thorne',
        'TITLE': 'VP Research',
        'EMAIL': 'athorne@helioshealth.org',
        'MOBILE PHONE': '+1 (617) 443-8899',
        'CORPORATE PHONE': '+1 (617) 443-8800',
        "WHAT'S APP NUMBER": '+1 (617) 443-8899',
        'COMPLETE ON': '2026-10-18',
        'MEETING DATE': '2026-11-10',
        'MEETING TIME': '11:00 AM',
        'LAST CONNECTED': '2026-10-25',
        'STATUS': 'Proposal Sent',
        'COMMENT': 'Demo scheduled',
        'FOLLOW-UPS': '2026-11-10',
        'ACTION': 'Follow up with team',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'vaeto_leads_template.xlsx');
    toast.success('Excel template downloaded');
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setIsImporting(true);
    setImportProgress(25);

    try {
      // Clean payload for backend
      const leadsPayload = parsedRows.map((r) => ({
        company: r.company,
        contactName: r.contactName,
        title: r.title || null,
        email: r.email || null,
        phone: r.phone || null,
        corporatePhone: r.corporatePhone || null,
        whatsappNumber: r.whatsappNumber || null,
        status: r.status || 'New',
        completedOn: r.completedOn || null,
        meetingDate: r.meetingDate || null,
        meetingTime: r.meetingTime || null,
        lastContact: r.lastContact || null,
        priority: r.priority || 'Medium',
        industry: r.industry || 'IT Services',
        source: r.source || 'Website',
        dealValue: r.dealValue || 0,
        comments: r.comments || null,
      }));

      setImportProgress(55);

      const result = await crmApi.bulkImportLeads({
        skipDuplicates,
        leads: leadsPayload,
      });

      setImportProgress(100);
      setImportResult(result);
      toast.success(
        `Import complete: ${result.importedCount} imported, ${result.skippedCount} skipped, ${result.failedCount} failed.`
      );
      onSuccess();
    } catch (err: any) {
      console.error('Import failed:', err);
      toast.error(err?.message || 'Failed to import leads to the server.');
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusBadgeClass = (status: string = '') => {
    const s = status.toLowerCase();
    if (s.includes('pending')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    }
    if (s.includes('negotiation')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    }
    if (s.includes('proposal')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (s.includes('new')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800';
    }
    if (s.includes('contact')) {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    }
    if (s.includes('won') || s.includes('complete')) {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  const previewRows = parsedRows.slice(0, 5);
  const errorCount = parsedRows.filter((r) => r._hasError).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-surface-dark border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Upload className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-navy dark:text-white">Import Leads from Excel</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Summary Screen after successful import */}
          {importResult ? (
            <div className="space-y-5 py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy dark:text-white">Import Completed Successfully</h3>
                <p className="text-xs text-muted mt-1">Your leads have been processed and saved to the database.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {importResult.importedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mt-0.5">
                    Imported
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                    {importResult.skippedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mt-0.5">
                    Skipped (Duplicates)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                  <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                    {importResult.failedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mt-0.5">
                    Failed
                  </div>
                </div>
              </div>

              {importResult.errorMessages && importResult.errorMessages.length > 0 && (
                <div className="text-left max-w-md mx-auto p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 max-h-32 overflow-y-auto">
                  <div className="font-bold mb-1">Validation Errors:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {importResult.errorMessages.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-indigo-200/90 dark:border-indigo-900/50 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex justify-center mb-2">
                  <CloudUpload className="h-10 w-10 text-indigo-500 dark:text-indigo-400 stroke-[1.6]" />
                </div>

                <p className="text-sm font-semibold text-navy dark:text-white">
                  Drag and drop your Excel file here
                </p>
                <p className="text-xs text-muted mt-0.5">
                  or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-medium text-primary hover:underline focus:outline-none"
                  >
                    browse files
                  </button>
                </p>

                <p className="text-[11px] text-muted/80 mt-1.5">Accepted formats: .xlsx, .xls, .csv</p>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mx-auto"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Excel Template
                </button>

                {selectedFile && (
                  <div className="mt-3.5 inline-flex items-center gap-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-muted text-[10px]">({Math.round(selectedFile.size / 1024)} KB)</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetState();
                      }}
                      className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Options Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-navy dark:text-white">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-indigo-600"
                  />
                  <span>Preview data before importing</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-indigo-600"
                  />
                  <span className="flex items-center gap-1">
                    Skip duplicate leads
                    <span title="Skips records with email addresses that already exist in your leads database.">
                      <Info className="h-3.5 w-3.5 text-muted hover:text-navy dark:hover:text-white" />
                    </span>
                  </span>
                </label>
              </div>

              {/* Validation Warning Alert */}
              {errorCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
                  <span>
                    <strong>{errorCount} row(s)</strong> have missing required fields or invalid emails and will be
                    flagged or skipped.
                  </span>
                </div>
              )}

              {/* Preview Table */}
              {showPreview && parsedRows.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy dark:text-white">Preview (First 5 rows)</span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                      {parsedRows.length} rows detected
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 text-muted font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2 text-center w-8">#</th>
                          <th className="px-3 py-2">Company Name</th>
                          <th className="px-3 py-2">Person Name</th>
                          <th className="px-3 py-2">Title</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Contact Number</th>
                          <th className="px-3 py-2">Corporate Phone</th>
                          <th className="px-3 py-2">What&apos;s App Number</th>
                          <th className="px-3 py-2">Complete On</th>
                          <th className="px-3 py-2">Meeting Date</th>
                          <th className="px-3 py-2">Meeting Time</th>
                          <th className="px-3 py-2">Last Connected</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Comment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-surface-dark">
                        {previewRows.map((r, i) => (
                          <tr
                            key={i}
                            className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                              r._hasError ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                            }`}
                          >
                            <td className="px-3 py-2 text-center text-muted font-mono">{r.sNo || r._rowNumber}</td>
                            <td className="px-3 py-2 font-medium text-navy dark:text-white max-w-[150px] truncate">
                              {r.company || <span className="text-rose-500 italic">Required</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[130px] truncate">
                              {r.contactName || <span className="text-rose-500 italic">Required</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400 max-w-[120px] truncate">
                              {r.title || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                              {r.email || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.phone || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.corporatePhone || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.whatsappNumber || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.completedOn || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.meetingDate || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.meetingTime || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.lastContact || <span className="text-muted/60">—</span>}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                                  r.status
                                )}`}
                              >
                                {r.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                              {r.comments || <span className="text-muted/60">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progress Bar during import */}
              {isImporting && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-muted font-medium">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      Importing {parsedRows.length} leads into database...
                    </span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800/80 px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/30">
          {importResult ? (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isImporting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={parsedRows.length === 0 || isImporting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {parsedRows.length > 0 ? `Import ${parsedRows.length} Leads` : 'Import Leads'}
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
