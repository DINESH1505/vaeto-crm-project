import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { GuestOnly, RequireAdmin, RequireAuth, RequirePermission } from './guards';

const Login = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

const Dashboard = lazy(() => import('../pages/Dashboard'));
const ManageLeads = lazy(() => import('../pages/leads/ManageLeads'));
const AddLead = lazy(() => import('../pages/leads/AddLead'));
const EditLead = lazy(() => import('../pages/leads/EditLead'));
const LeadDetails = lazy(() => import('../pages/leads/LeadDetails'));
const Tasks = lazy(() => import('../pages/Tasks'));
const FollowUps = lazy(() => import('../pages/FollowUps'));
const ScheduleMeeting = lazy(() => import('../pages/ScheduleMeeting'));
const CalendarPage = lazy(() => import('../pages/Calendar'));
const Reports = lazy(() => import('../pages/Reports'));
const Profile = lazy(() => import('../pages/account/Profile'));
const ChangePassword = lazy(() => import('../pages/account/ChangePassword'));
const Notifications = lazy(() => import('../pages/account/Notifications'));
const Settings = lazy(() => import('../pages/account/Settings'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const RolesPermissions = lazy(() => import('../pages/admin/RolesPermissions'));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'));
const NotFound = lazy(() => import('../pages/NotFound'));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<GuestOnly><AuthLayout /></GuestOnly>}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      {/* Reset is reachable while signed in or out (e.g. from an emailed link). */}
      <Route element={<AuthLayout />}>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<ManageLeads />} />
        <Route path="/leads/new" element={<RequirePermission permission="leads.create"><AddLead /></RequirePermission>} />
        <Route path="/leads/:id" element={<LeadDetails />} />
        <Route path="/leads/:id/edit" element={<RequirePermission permission="leads.edit"><EditLead /></RequirePermission>} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/meetings/new" element={<ScheduleMeeting />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/reports" element={<RequirePermission permission="reports.view"><Reports /></RequirePermission>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<RequireAdmin><UserManagement /></RequireAdmin>} />
        <Route path="/admin/roles" element={<RequireAdmin><RolesPermissions /></RequireAdmin>} />
        <Route path="/admin/settings" element={<RequireAdmin><SystemSettings /></RequireAdmin>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
