import React from 'react';
import { NavLink } from 'react-router-dom';
import { Ticket, Users, Clock, CheckCircle, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', icon: BarChart2, to: '/dashboard' },
  { label: 'Open Tickets', icon: Ticket, to: '/open-tickets' },
  { label: 'In Progress', icon: Clock, to: '/in-progress' },
  { label: 'Resolved', icon: CheckCircle, to: '/resolved-today' },
  { label: 'Agents', icon: Users, to: '/active-agents' },
  { label: 'My Tickets', icon: Ticket, to: '/my-tickets' },
];

const Sidebar: React.FC = () => {
  const { signOut } = useAuth();
  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="flex items-center h-16 px-6 font-bold text-xl text-blue-700 dark:text-blue-300 border-b border-gray-100 dark:border-gray-800">
        SynapSolve
      </div>
      <nav className="flex-1 py-4 space-y-2">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition font-medium gap-3 ${
                isActive ? 'bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300 font-semibold' : ''
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="flex items-center gap-3 px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition font-medium mb-4"
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
