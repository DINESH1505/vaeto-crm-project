import { useState } from 'react';
import { Download, RefreshCw, Save } from 'lucide-react';
import { Button, ConfirmDialog, Input, Select } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/helpers';

export default function SystemSettings() {
  const { settings, updateSettings, resetDemoData, exportAll } = useData();
  const toast = useToast();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [currency, setCurrency] = useState(settings.currency);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [maintenanceBanner, setMaintenanceBanner] = useState(settings.maintenanceBanner);

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      supportEmail,
      currency,
      dateFormat,
      timezone,
      maintenanceBanner,
    });
    toast.success('System settings updated successfully');
  };

  const handleExportData = () => {
    const dataStr = exportAll();
    downloadFile(`vaeto_crm_export_${new Date().toISOString().slice(0, 10)}.json`, dataStr, 'application/json');
    toast.success('Workspace demo data downloaded as JSON');
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setResetConfirm(false);
    toast.success('Demo dataset has been reset to default initial state');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
          System Settings
        </h1>
        <p className="text-xs text-muted">
          Configure organisation-wide preferences, maintenance announcements, and data resets.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-sm font-bold text-navy dark:text-white border-b border-line pb-3">
            Company & Regional
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Organization Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              options={['INR', 'USD', 'EUR', 'GBP']}
            />
            <Select
              label="Date Display Format"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as any)}
              options={['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
            />
          </div>

          <Input
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />

          <h2 className="text-sm font-bold text-navy dark:text-white border-b border-line pb-3 pt-4">
            System Maintenance Notice
          </h2>

          <Input
            label="Global Maintenance Banner (Optional)"
            placeholder="e.g. Scheduled CRM upgrade tonight at 11:00 PM IST"
            value={maintenanceBanner}
            onChange={(e) => setMaintenanceBanner(e.target.value)}
            hint="Displays across the top of all user screens when set."
          />

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save System Settings
            </Button>
          </div>
        </form>
      </div>

      {/* Backup and Demo Reset Card */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-navy dark:text-white border-b border-line pb-3">
          Demo Data Management
        </h2>
        <p className="mt-2 text-xs text-muted">
          This frontend stores mock state in your browser&apos;s localStorage. You can download a full
          JSON snapshot or restore the initial reference demonstration data.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export Full JSON Backup
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setResetConfirm(true)}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Reset Demo Data to Initial Seeds
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirm}
        title="Reset Demo Data"
        message="Are you sure you want to restore the initial demo state? All customized leads and meetings created in this browser will be reset."
        confirmLabel="Reset Everything"
        tone="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetConfirm(false)}
      />
    </div>
  );
}
