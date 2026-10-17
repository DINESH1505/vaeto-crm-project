import { Button, Toggle } from '../../components/ui';
import { usePreferences } from '../../context/PreferencesContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export default function Settings() {
  const { prefs, setPrefs } = usePreferences();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const handleSave = () => {
    toast.success('Your preferences have been saved');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
          Account Settings & Preferences
        </h1>
        <p className="text-xs text-muted">Customize your alerts, display theme, and lead tables.</p>
      </div>

      <div className="card p-6 divide-y divide-line">
        {/* Theme Settings */}
        <div className="pb-4">
          <h3 className="text-sm font-bold text-navy dark:text-white mb-2">Display Theme</h3>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  theme === mode
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'border border-line bg-surface text-ink hover:bg-soft'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="py-4 space-y-1">
          <h3 className="text-sm font-bold text-navy dark:text-white mb-2">Notification Preferences</h3>
          <Toggle
            label="In-App Notifications"
            description="Show toast banners and notifications bell alerts for upcoming activities"
            checked={prefs.inAppNotifications}
            onChange={(v) => setPrefs({ inAppNotifications: v })}
          />
          <Toggle
            label="Follow-up Reminders"
            description="Alert me 30 minutes before a scheduled follow-up"
            checked={prefs.followUpReminders}
            onChange={(v) => setPrefs({ followUpReminders: v })}
          />
          <Toggle
            label="Weekly Pipeline Summary"
            description="Send a digest of converted deals and new leads"
            checked={prefs.weeklySummary}
            onChange={(v) => setPrefs({ weeklySummary: v })}
          />
        </div>

        {/* View Preferences */}
        <div className="py-4 space-y-1">
          <h3 className="text-sm font-bold text-navy dark:text-white mb-2">Workspace & Views</h3>
          <Toggle
            label="Show Upcoming Follow-ups Panel"
            description="Display the right-hand side follow-ups card on the main dashboard"
            checked={prefs.showFollowUpPanel}
            onChange={(v) => setPrefs({ showFollowUpPanel: v })}
          />
          <Toggle
            label="Compact Tables"
            description="Display denser table rows with reduced padding"
            checked={prefs.compactTables}
            onChange={(v) => setPrefs({ compactTables: v })}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
