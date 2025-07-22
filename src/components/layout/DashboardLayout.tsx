import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-auto">
      {children}
    </main>
  </div>
);

export default DashboardLayout;
