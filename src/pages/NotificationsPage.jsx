import React, { useEffect, useState } from 'react';
import BackButton from '../components/common/BackButton';
import { useAuth } from '../hooks/useAuth';
import { listenToNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import { Calendar, CheckCircle, XCircle, RefreshCcw, Bell } from 'lucide-react';

const notificationTypeStyles = {
  calendar_created: 'text-green-600 dark:text-green-400',
  calendar_updated: 'text-yellow-600 dark:text-yellow-400',
  calendar_deleted: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
};

const notificationIcons = {
  calendar_created: <Calendar className="w-5 h-5" />,
  calendar_updated: <RefreshCcw className="w-5 h-5" />,
  calendar_deleted: <XCircle className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  info: <Bell className="w-5 h-5" />,
  warning: <RefreshCcw className="w-5 h-5" />,
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    console.log("Fetching notifications for", user.uid);
    const unsubscribe = listenToNotifications(user.uid, (notifs) => {
      console.log("Query snapshot size:", notifs.length);
      setNotifications(notifs);
      setLoading(false);
    });
    // Defensive: set loading false after 5s in case callback never fires
    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => {
      unsubscribe && unsubscribe();
      clearTimeout(timeout);
    };
  }, [user]);

  const handleMarkAllRead = async () => {
    if (user) await markAllNotificationsAsRead(user.uid);
  };

  const handleMarkRead = async (notif) => {
    if (!notif.read) await markNotificationAsRead(notif.id);
  };

  return (
    <div className="relative max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <BackButton className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition" />
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Notifications</h2>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleMarkAllRead}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          Mark All as Read
        </button>
      </div>
      <ul className="space-y-4">
        {loading ? (
          <li className="text-gray-500 dark:text-gray-400">Loading...</li>
        ) : notifications.length === 0 ? (
          <li className="text-gray-500 dark:text-gray-400">No notifications.</li>
        ) : (
          notifications.map((n) => {
            const type = n.type || 'info';
            return (
              <li
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm transition cursor-pointer ${n.read ? 'opacity-70' : 'opacity-100'}`}
                onMouseEnter={() => handleMarkRead(n)}
                onClick={() => handleMarkRead(n)}
              >
                <span className={`mt-1 ${notificationTypeStyles[type] || 'text-blue-600 dark:text-blue-400'}`}>
                  {notificationIcons[type] || <Bell className="w-5 h-5" />}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{n.message}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-300">{new Date(n.timestamp || n.createdAt).toLocaleString()}</span>
                </div>
                {!n.read && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default NotificationsPage;
