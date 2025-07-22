import React from 'react';
import { TicketForm } from '../components/tickets/TicketForm';
import DashboardLayout from '../components/layout/DashboardLayout';

const SubmitTicketPage: React.FC = () => (
  <DashboardLayout>
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Submit a New Ticket</h1>
      <TicketForm />
    </div>
  </DashboardLayout>
);

export default SubmitTicketPage;
