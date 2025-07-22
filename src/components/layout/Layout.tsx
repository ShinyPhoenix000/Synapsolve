import React, { useState, useRef } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { HomeIcon, TicketIcon, BarChartIcon, SettingsIcon, UserIcon, BellIcon, SunIcon, MoonIcon, LogOutIcon, StarIcon, Search as SearchIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Fuse, { FuseResult } from 'fuse.js';
import NotificationsDropdown from './NotificationsDropdown';

const PAGE_SUGGESTIONS = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Open Tickets', path: '/open-tickets' },
  { label: 'Settings', path: '/settings' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Submit Feedback', path: '/submit-feedback' },
  { label: 'Profile', path: '/profile' },
  { label: 'Notifications', path: '/notifications' },
];

const fuse = new Fuse<{ label: string; path: string }>(PAGE_SUGGESTIONS, {
  keys: ['label'],
  threshold: 0.4,
});

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<b>{text.slice(idx, idx + query.length)}</b>{text.slice(idx + query.length)}</>;
}

function getInitialsAvatar(email: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email || 'user')}`;
}

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  let sidebarItems = [];
  if (user?.role === 'user') {
    sidebarItems = [
      { to: '/dashboard', icon: <HomeIcon className="text-gray-700 dark:text-gray-200" />, label: 'Home' },
      { to: '/open-tickets', icon: <TicketIcon className="text-gray-700 dark:text-gray-200" />, label: 'My Tickets' },
      { to: '/submit-feedback', icon: <StarIcon className="text-gray-700 dark:text-gray-200" />, label: 'Submit Feedback' },
      { to: '/settings', icon: <SettingsIcon className="text-gray-700 dark:text-gray-200" />, label: 'Settings' },
      { to: '/notifications', icon: <BellIcon className="text-gray-700 dark:text-gray-200" />, label: 'Notifications' },
    ];
  } else if (user?.role === 'agent') {
    sidebarItems = [
      { to: '/dashboard', icon: <HomeIcon className="text-gray-700 dark:text-gray-200" />, label: 'Home' },
      { to: '/assigned-tickets', icon: <TicketIcon className="text-gray-700 dark:text-gray-200" />, label: 'My Assigned Tickets' },
      { to: '/in-progress-tickets', icon: <TicketIcon className="text-gray-700 dark:text-gray-200" />, label: 'In Progress' },
      { to: '/analytics', icon: <BarChartIcon className="text-gray-700 dark:text-gray-200" />, label: 'Analytics' },
      { to: '/settings', icon: <SettingsIcon className="text-gray-700 dark:text-gray-200" />, label: 'Settings' },
      { to: '/notifications', icon: <BellIcon className="text-gray-700 dark:text-gray-200" />, label: 'Notifications' },
    ];
  } else {
    sidebarItems = [
      { to: '/dashboard', icon: <HomeIcon className="text-gray-700 dark:text-gray-200" />, label: 'Home' },
      { to: '/open-tickets', icon: <TicketIcon className="text-gray-700 dark:text-gray-200" />, label: 'Open Tickets' },
      { to: '/analytics', icon: <BarChartIcon className="text-gray-700 dark:text-gray-200" />, label: 'Analytics' },
      { to: '/settings', icon: <SettingsIcon className="text-gray-700 dark:text-gray-200" />, label: 'Settings' },
      { to: '/submit-feedback', icon: <StarIcon className="text-gray-700 dark:text-gray-200" />, label: 'Submit Feedback' },
      { to: '/notifications', icon: <BellIcon className="text-gray-700 dark:text-gray-200" />, label: 'Notifications' },
    ];
  }

  // Fuzzy search for suggestions
  const fuseResults = searchQuery ? fuse.search(searchQuery) : [];
  const filteredSuggestions = searchQuery
    ? fuseResults.map((r: FuseResult<{ label: string; path: string }>) => r.item)
    : [];

  const handleSuggestionClick = (path: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIdx(idx => (idx + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      setHighlightedIdx(idx => (idx - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        handleSuggestionClick(filteredSuggestions[highlightedIdx].path);
      } else if (searchQuery) {
        // Fallback: go to closest match
        const best = fuse.search(searchQuery)[0];
        if (best) handleSuggestionClick(best.item.path);
        else handleSuggestionClick('/dashboard');
      }
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 z-40">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mb-6 flex items-center justify-center w-12 h-12 rounded-full transition-colors hover:bg-blue-100 dark:hover:bg-blue-800 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'}`
            }
            aria-label={item.label}
          >
            {item.icon}
          </NavLink>
        ))}
      </aside>
      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-16 h-full">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SynapSolve</span>
            </Link>
          </div>
          {/* Search bar with fuzzy autocomplete */}
          <div className="relative w-1/3 max-w-xs flex-1 mx-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages..."
                className="w-full pl-10 pr-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setHighlightedIdx(0);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                onKeyDown={handleInputKeyDown}
                aria-label="Search"
              />
            </div>
            {showSuggestions && (
              <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((s: { label: string; path: string }, idx: number) => (
                    <li
                      key={s.label}
                      className={`px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors ${idx === highlightedIdx ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onMouseDown={() => handleSuggestionClick(s.path)}
                      onMouseEnter={() => setHighlightedIdx(idx)}
                    >
                      {highlightMatch(s.label, searchQuery)}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500 dark:text-gray-400">No match found – try <b>Home</b>?</li>
                )}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-4 relative">
            {/* Notifications bell dropdown */}
            <NotificationsDropdown />
            {/* Profile avatar button */}
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 focus:outline-none"
              aria-label="Open profile menu"
            >
              {user?.photoURL || user?.email ? (
                <img
                  src={user.photoURL || getInitialsAvatar(user.email)}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6" />
              )}
            </button>
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 py-2">
                <button
                  onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UserIcon className="w-4 h-4 mr-2" /> View Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" /> Settings
                </button>
                <button
                  onClick={() => { navigate('/notifications'); setDropdownOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <BellIcon className="w-4 h-4 mr-2" /> Notifications
                </button>
                <div className="px-4 py-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-semibold">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDark ? (
                    <SunIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <MoonIcon className="w-4 h-4 mr-2" />
                  )}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  onClick={() => { signOut(); setDropdownOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Content Area */}
        <main className="flex-1 overflow-y-scroll p-6 bg-background">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;