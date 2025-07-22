import { BellIcon, Calendar, RefreshCcw, XCircle, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listenToNotifications, markNotificationAsRead } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { Notification } from '../../types';

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
  info: <BellIcon className="w-5 h-5" />,
  warning: <RefreshCcw className="w-5 h-5" />,
};

const NotificationsDropdown = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToNotifications(user.uid, (notifs) => {
      setNotifications(notifs as Notification[]);
    });
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) await markNotificationAsRead(notif.id);
    if (notif.ticketId) navigate(`/tickets/${notif.ticketId}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative text-gray-600 dark:text-gray-200"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 shadow-lg rounded-lg z-50">
          <div className="p-4 max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">No notifications.</div>
            ) : (
              recentNotifications.map((notif) => {
                const type = notif.type || 'info';
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition ${notif.read ? 'opacity-70' : 'opacity-100'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <span className={`mt-1 ${notificationTypeStyles[type] || 'text-blue-600 dark:text-blue-400'}`}>
                      {notificationIcons[type] || <BellIcon className="w-5 h-5" />}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200 mb-1 text-sm">{notif.message}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-300">{new Date(notif.timestamp || notif.createdAt).toLocaleString()}</span>
                    </div>
                    {!notif.read && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                  </div>
                );
              })
            )}
            <Link
              to="/notifications"
              className="block mt-4 text-blue-600 dark:text-blue-400 hover:underline text-center"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
