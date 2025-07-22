import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { auth } from '../../config/firebase';
import {
  UserIcon,
  LogOutIcon,
  SunIcon,
  EditIcon,
  KeyIcon,
  BellIcon,
  HelpCircleIcon,
  BugIcon,
  FileTextIcon,
  LayoutDashboardIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hook to handle click outside the menu
function useClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);
}

const ProfileMenu: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationPref, setNotificationPref] = useState(() => {
    const saved = localStorage.getItem('notificationPref');
    return saved ? JSON.parse(saved) : true;
  });

  useClickOutside(menuRef, () => setOpen(false));

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('notificationPref', JSON.stringify(notificationPref));
  }, [notificationPref]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleNotificationToggle = () => {
    setNotificationPref((prev: boolean) => !prev);
  };

  const role = user?.role || 'User';
  const name = user?.displayName || 'Anonymous';
  const photo = user?.photoURL;

  return (
    <div className="static">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
      >
        {photo ? (
          <img src={photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="fixed top-16 right-4 w-72 z-[99999] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in"
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            {photo ? (
              <img src={photo} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-gray-600 dark:text-gray-300" />
            )}
            <div>
              <div className="font-semibold text-lg">{name}</div>
              <div className="text-sm text-muted-foreground">Role: {role}</div>
            </div>
          </div>

          <ul className="py-2" role="menu">
            <MenuItem icon={<UserIcon />} label="View Profile" onClick={() => navigate('/profile')} />
            <MenuItem icon={<EditIcon />} label="Edit Profile" onClick={() => navigate('/profile/edit')} />
            <MenuItem icon={<KeyIcon />} label="Change Password" onClick={() => navigate('/profile/change-password')} />
            <MenuItem
              icon={<BellIcon />}
              label="Notification Preferences"
              onClick={() => navigate('/settings')}
            />
            <MenuItem icon={<FileTextIcon />} label="Submit Feedback" onClick={() => navigate('/feedback')} />
            <MenuItem icon={<HelpCircleIcon />} label="Help / Documentation" onClick={() => navigate('/help')} />
            <MenuItem icon={<BugIcon />} label="Report a Bug" onClick={() => navigate('/report-bug')} />
            <MenuItem icon={<SunIcon />} label="Toggle Dark Mode" onClick={toggleTheme} />
            <MenuItem icon={<LayoutDashboardIcon />} label="Dashboard" onClick={() => navigate('/')} />
            <MenuItem
              icon={<LogOutIcon />}
              label="Logout"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
            />
          </ul>
        </div>
      )}
    </div>
  );
};

// Reusable menu item component
const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  trailingText?: string;
  className?: string;
}> = ({ icon, label, onClick, trailingText, className = '' }) => (
  <li>
    <button
      role="menuitem"
      tabIndex={0}
      className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 focus:bg-gray-200 dark:hover:bg-gray-800 dark:focus:bg-gray-700 transition outline-none ${className}`}
      onClick={onClick}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
      {trailingText && (
        <span className="ml-auto text-xs text-muted-foreground">{trailingText}</span>
      )}
    </button>
  </li>
);

export default ProfileMenu;