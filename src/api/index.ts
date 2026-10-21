import { apiRequest } from './client';

export interface BackendAuthResponse {
  token: string;
  tokenType: string;
  user: any;
  role: any;
}

export const crmApi = {
  // Health
  checkHealth: () => apiRequest<{ status: string }>('/health'),

  // Auth
  login: (credentials: { email: string; password: string; remember?: boolean }) =>
    apiRequest<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: () => apiRequest<{ user: any; role: any }>('/auth/me'),

  logout: () =>
    apiRequest<void>('/auth/logout', {
      method: 'POST',
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getStats: () => apiRequest<any>('/dashboard/stats'),
  getLeadStatus: () => apiRequest<any>('/dashboard/lead-status'),
  getUpcomingFollowUps: () => apiRequest<any[]>('/dashboard/upcoming-followups'),

  // Leads
  getLeads: (params: { page?: number; size?: number; search?: string; status?: string; source?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.source) query.set('source', params.source);
    return apiRequest<any>(`/leads?${query.toString()}`);
  },

  getLeadById: (id: string) => apiRequest<any>(`/leads/${id}`),

  createLead: (lead: any) =>
    apiRequest<any>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    }),

  updateLead: (id: string, lead: any) =>
    apiRequest<any>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    }),

  deleteLead: (id: string) =>
    apiRequest<void>(`/leads/${id}`, {
      method: 'DELETE',
    }),

  // Tasks
  getTasks: (assigneeId?: string) => {
    const query = assigneeId ? `?assigneeId=${encodeURIComponent(assigneeId)}` : '';
    return apiRequest<any[]>(`/tasks${query}`);
  },

  createTask: (task: any) =>
    apiRequest<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateTask: (id: string, task: any) =>
    apiRequest<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),

  toggleTaskStatus: (id: string, status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<any>(`/tasks/${id}/status${query}`, {
      method: 'PATCH',
    });
  },

  deleteTask: (id: string) =>
    apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Follow-ups
  getFollowUps: (params: { page?: number; size?: number; ownerId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.ownerId) query.set('ownerId', params.ownerId);
    return apiRequest<any>(`/follow-ups?${query.toString()}`);
  },

  createFollowUp: (followUp: any) =>
    apiRequest<any>('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(followUp),
    }),

  completeFollowUp: (id: string) =>
    apiRequest<any>(`/follow-ups/${id}/complete`, {
      method: 'PATCH',
    }),

  deleteFollowUp: (id: string) =>
    apiRequest<void>(`/follow-ups/${id}`, {
      method: 'DELETE',
    }),

  // Meetings
  getMeetings: (params: { startDate?: string; endDate?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    return apiRequest<any[]>(`/meetings?${query.toString()}`);
  },

  createMeeting: (meeting: any) =>
    apiRequest<any>('/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    }),

  deleteMeeting: (id: string) =>
    apiRequest<void>(`/meetings/${id}`, {
      method: 'DELETE',
    }),

  // Admin
  getUsers: () => apiRequest<any[]>('/admin/users'),
  getAuditLogs: () => apiRequest<any[]>('/admin/audit-logs'),
};
