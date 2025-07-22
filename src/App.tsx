import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { AuthPage } from './components/auth/AuthPage';
import { Loader } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ProfilePage from './pages/ProfilePage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SelectRole from './pages/SelectRole.tsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage';
import AgentsPage from './pages/AgentsPage.jsx';
import SubmitFeedbackPage from './pages/SubmitFeedbackPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.tsx';
import AssignedTicketsPage from './pages/AssignedTicketsPage';
import OpenTicketsPage from './pages/OpenTicketsPage';
import InProgressTicketsPage from './pages/InProgressTicketsPage';
import ResolvedTodayPage from './pages/ResolvedTodayPage';
import ActiveAgentsPage from './pages/ActiveAgentsPage';
import NotFoundPage from './pages/NotFoundPage';
import Modal from './components/common/Modal';
import Toaster from './components/common/Toaster';
import toast from 'react-hot-toast';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import { calendarService } from './services/calendarService';
import SubmitTicketPage from './pages/SubmitTicketPage';
import MyTickets from './pages/MyTickets';

function App() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [checkingCalendar, setCheckingCalendar] = useState(true);

  useEffect(() => {
    const checkCalendarConnection = async () => {
      if (!user || (user.role !== 'agent' && user.role !== 'admin')) {
        setShowCalendarModal(false);
        setCheckingCalendar(false);
        return;
      }
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists() || !userSnap.data().calendarConnected) {
        setShowCalendarModal(true);
      } else {
        setShowCalendarModal(false);
      }
      setCheckingCalendar(false);
    };
    checkCalendarConnection();
  }, [user]);

  const handleConnectCalendar = async () => {
    try {
      const success = await calendarService.signIn();
      if (success && user) {
        await updateDoc(doc(db, 'users', user.uid), { calendarConnected: true });
        setShowCalendarModal(false);
        toast.success('Google Calendar connected!');
      } else {
        toast.error('Failed to connect Google Calendar.');
      }
    } catch (e) {
      toast.error('Google Calendar connection failed.');
    }
  };

  if (loading || checkingCalendar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading SynapSolve...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster position="top-right" toastOptions={{
        style: { background: isDark ? '#22223b' : '#fff', color: isDark ? '#fff' : '#22223b' },
      }} />
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Connect Google Calendar"
      >
        <p className="mb-4 text-gray-700 dark:text-gray-200">To enable ticket-linked events and reminders, please connect your Google Calendar.</p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={handleConnectCalendar}
        >
          Connect Google Calendar
        </button>
      </Modal>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-800 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-800 rounded-full mix-blend-multiply opacity-30 animate-blob animation-delay-4000" />
      </div>
      <div className="relative z-10">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/submit-feedback" element={<SubmitFeedbackPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/open-tickets" element={<OpenTicketsPage />} />
            <Route path="/in-progress" element={<InProgressTicketsPage />} />
            <Route path="/resolved-today" element={<ResolvedTodayPage />} />
            <Route path="/active-agents" element={<ActiveAgentsPage />} />
            <Route path="/assigned-tickets" element={<AssignedTicketsPage />} />
            <Route path="/submit-ticket" element={<SubmitTicketPage />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;