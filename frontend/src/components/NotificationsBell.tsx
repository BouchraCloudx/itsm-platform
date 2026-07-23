import { useEffect, useState, useRef } from 'react';
import { notificationApi } from '../api/client';
import type { Notification } from '../types';

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 15000);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleClickOutside(e: MouseEvent) {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }

  async function loadUnreadCount() {
    const { data } = await notificationApi.get('/notifications/unread-count');
    setUnreadCount(data.count);
  }

  async function toggleOpen() {
    if (!open) {
      const { data } = await notificationApi.get('/notifications');
      setNotifications(data);
    }
    setOpen(!open);
  }

  async function markAsRead(id: string) {
    await notificationApi.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    loadUnreadCount();
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleOpen} className="relative p-2 rounded-md hover:bg-slate-100">
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-slate-100 text-sm font-semibold text-slate-900">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50' : ''}`}
              >
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
