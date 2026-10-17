import { useState } from 'react';
import { Avatar, Button, Input, Textarea } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function Profile() {
  const { user, role } = useAuth();
  const { updateUser } = useData();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateUser(user.id, {
      name,
      phone,
      jobTitle,
      department,
      location,
      bio,
    });

    toast.success('Profile details updated successfully');
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-navy dark:text-white sm:text-2xl">My Profile</h1>
        <p className="text-xs text-muted">Manage your personal details and CRM workspace identity.</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start border-b border-line pb-6">
          <Avatar name={user.name} size="xl" />
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-navy dark:text-white">{user.name}</h2>
            <p className="text-xs text-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {role?.name || 'User'}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                Status: {user.status}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Work Email"
              value={user.email}
              disabled
              hint="Email address cannot be changed in demo mode"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <Input
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Work Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Textarea
            label="Professional Bio"
            placeholder="A brief note about your responsibilities or portfolio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit">
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
