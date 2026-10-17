import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

/** Notifications addressed to the signed-in user (or broadcast to everyone). */
export function useMyNotifications() {
  const { notifications } = useData();
  const { user } = useAuth();
  return useMemo(() => {
    const mine = notifications
      .filter((n) => n.userId === 'all' || n.userId === user?.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { items: mine, unread: mine.filter((n) => !n.read).length };
  }, [notifications, user?.id]);
}
