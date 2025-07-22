import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';

function getInitialsAvatar(email: string) {
  // Use DiceBear initials avatar
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email || 'user')}`;
}

export const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 focus:outline-none"
        aria-label="Open profile menu"
      >
        <img
          src={user.photoURL || getInitialsAvatar(user.email)}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 py-2">
          <div className="flex flex-col items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <img
              src={user.photoURL || getInitialsAvatar(user.email)}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover mb-2"
            />
            <div className="font-semibold text-gray-900 dark:text-white">{user.displayName || 'User'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
          <button
            onClick={() => { navigate('/profile'); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            View Profile
          </button>
          <button
            onClick={() => { navigate('/settings'); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Settings
          </button>
          <button
            onClick={() => { navigate('/notifications'); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Notifications
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? (
              <Sun className="w-4 h-4 mr-2" />
            ) : (
              <Moon className="w-4 h-4 mr-2" />
            )}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};
