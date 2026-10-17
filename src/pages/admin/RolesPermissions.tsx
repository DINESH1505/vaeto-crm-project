import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Checkbox } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { ALL_PERMISSIONS } from '../../data/sampleData';
import { Permission, Role } from '../../types';

export default function RolesPermissions() {
  const { roles, updateRole } = useData();
  const toast = useToast();

  const [selectedRole, setSelectedRole] = useState<Role>(roles[0] || null);

  const handleTogglePermission = (perm: Permission) => {
    if (!selectedRole || selectedRole.id === 'role_admin') return;

    const current = selectedRole.permissions;
    const nextPerms = current.includes(perm)
      ? current.filter((p) => p !== perm)
      : [...current, perm];

    const updated = { ...selectedRole, permissions: nextPerms };
    setSelectedRole(updated);
    updateRole(selectedRole.id, { permissions: nextPerms });
    toast.success('Permission settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
          Roles & Permissions
        </h1>
        <p className="text-xs text-muted">
          Define access control matrices and grant module permissions across user groups.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Roles List */}
        <div className="space-y-2 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">System Roles</p>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                selectedRole?.id === r.id
                  ? 'border-brand-400 bg-brand-50/60 shadow-sm dark:bg-brand-500/10'
                  : 'border-line bg-surface hover:bg-soft'
              }`}
            >
              <div>
                <p className="text-sm font-bold text-navy dark:text-white">{r.name}</p>
                <p className="text-[11px] text-muted">{r.permissions.length} permissions</p>
              </div>
              {r.isAdmin && <ShieldCheck className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>

        {/* Permissions Grid */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-base font-bold text-navy dark:text-white">
                Permissions for {selectedRole?.name}
              </h2>
              <p className="text-xs text-muted">{selectedRole?.description}</p>
            </div>
            {selectedRole?.id === 'role_admin' && (
              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                Full System Admin (Locked)
              </span>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {ALL_PERMISSIONS.map((p) => {
              const isChecked = selectedRole?.permissions.includes(p.key);
              const isLocked = selectedRole?.id === 'role_admin';

              return (
                <div
                  key={p.key}
                  className="flex items-start justify-between rounded-xl border border-line p-3 transition hover:bg-soft/40"
                >
                  <div>
                    <p className="text-xs font-bold text-ink">{p.label}</p>
                    <p className="text-[11px] text-muted">{p.description}</p>
                    <span className="mt-1 inline-block text-[10px] font-semibold text-brand-600 dark:text-brand-300">
                      Module: {p.group}
                    </span>
                  </div>

                  <Checkbox
                    checked={isChecked}
                    disabled={isLocked}
                    onChange={() => handleTogglePermission(p.key)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
