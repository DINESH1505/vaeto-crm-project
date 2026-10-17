import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Permission } from '../types';
import { EmptyState } from '../components/ui';

/** Requires a signed-in user. NOTE: client-side guards are UX only; a backend must enforce access. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="card mx-auto mt-6 max-w-xl">
      <EmptyState icon={<ShieldAlert />} title="Access denied" message={message} />
    </div>
  );
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <AccessDenied message="This area is only available to administrators." />;
  return <>{children}</>;
}

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useAuth();
  if (!can(permission)) return <AccessDenied message="Your role does not have permission to view this page. Contact your administrator." />;
  return <>{children}</>;
}
