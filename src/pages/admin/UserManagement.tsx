import { useState } from 'react';
import { Pencil, UserPlus, Trash2 } from 'lucide-react';
import { Avatar, Button, ConfirmDialog, Input, Modal, Select } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { User, UserStatus } from '../../types';
import { formatDate } from '../../utils/date';

export default function UserManagement() {
  const { users, roles, addUser, updateUser, deleteUser } = useData();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Demo@123');
  const [roleId, setRoleId] = useState('role_user');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [department, setDepartment] = useState('Sales');
  const [phone, setPhone] = useState('');

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('Demo@123');
    setRoleId('role_user');
    setStatus('Active');
    setDepartment('Sales');
    setPhone('');
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword(u.password);
    setRoleId(u.roleId);
    setStatus(u.status);
    setDepartment(u.department);
    setPhone(u.phone);
    setModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        password,
        roleId,
        status,
        department,
        phone,
      });
      toast.success(`User "${name}" updated`);
    } else {
      addUser({
        name,
        email,
        password,
        roleId,
        status,
        department,
        phone,
        jobTitle: 'Sales Representative',
        location: 'India',
        bio: '',
      });
      toast.success(`User "${name}" invited successfully`);
    }

    setModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    toast.success(`User "${userToDelete.name}" removed`);
    setUserToDelete(null);
  };

  const roleMap = new Map(roles.map((r) => [r.id, r.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">
            User Management
          </h1>
          <p className="text-xs text-muted">
            Manage team members, roles, statuses, and access privileges.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Add New User
        </Button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-soft/40 text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-soft/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <span className="font-bold text-navy dark:text-white">{u.name}</span>
                        <span className="block text-[11px] text-muted">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-lg bg-soft px-2 py-0.5 font-semibold text-ink">
                      {roleMap.get(u.roleId) || 'User'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted">{u.department || 'Sales'}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted whitespace-nowrap">
                    {u.lastLogin ? formatDate(u.lastLogin.slice(0, 10)) : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(u)}
                        className="rounded-lg p-1.5 text-muted hover:bg-soft hover:text-brand-600"
                        title="Edit user"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        disabled={u.id === 'u_admin'}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-500/10"
                        title="Delete user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@vaetotech.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Temporary Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assigned Role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
            />
            <Select
              label="Account Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              options={['Active', 'Inactive']}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirm */}
      <ConfirmDialog
        open={!!userToDelete}
        title="Remove User"
        message={`Are you sure you want to remove user "${userToDelete?.name}"?`}
        confirmLabel="Remove User"
        tone="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
