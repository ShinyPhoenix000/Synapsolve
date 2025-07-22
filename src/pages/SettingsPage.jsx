import React, { useState } from 'react';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white">Enable Notifications</span>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications((n) => !n)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white">Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => {
              setDarkMode((d) => !d);
              if (!darkMode) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
