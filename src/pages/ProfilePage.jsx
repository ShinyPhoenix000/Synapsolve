import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import BackButton from '../components/common/BackButton';
import { activeCalendarService } from '../services/calendarService';
import DeleteAccountModal from '../components/common/DeleteAccountModal';
import toast from 'react-hot-toast';
import { deleteAccountAndData } from '../services/deleteAccountService';

function getInitialsAvatar(email) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email || 'user')}`;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [calendarConnected, setCalendarConnected] = useState(activeCalendarService.isSignedIn());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleConnectCalendar = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await activeCalendarService.signIn();
      setCalendarConnected(success);
      if (!success) setError('Failed to connect Google Calendar.');
    } catch (e) {
      setError('Failed to connect Google Calendar.');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async (confirmationText) => {
    if (confirmationText !== 'DELETE') return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccountAndData(user);
      toast.success('Your account has been deleted.');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (e) {
      setDeleteError('Failed to delete account. Please try again or contact support.');
      toast.error('Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="relative max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <BackButton className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition" aria-label="Back to Dashboard" />
      <div className="flex flex-col items-center mt-8">
        {user?.photoURL || user?.email ? (
          <img src={user.photoURL || getInitialsAvatar(user.email)} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg mb-4" />
        ) : (
          <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl mb-4 border-4 border-blue-500 shadow-lg">
            {user?.displayName?.[0] || 'U'}
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile</h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 w-full max-w-md shadow">
          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">{user?.displayName || 'Anonymous'}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Role: <span className="capitalize">{user?.role || 'User'}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Email: {user?.email}</div>
          {user?.phoneNumber && <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Phone: {user.phoneNumber}</div>}
          {user?.createdAt && <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Account Created: {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : user.createdAt}</div>}
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={handleConnectCalendar}
          disabled={calendarConnected || loading}
          className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition ${calendarConnected ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {calendarConnected ? 'Google Calendar Connected' : loading ? 'Connecting...' : 'Connect Google Calendar'}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="mt-8 px-4 py-2 rounded bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </div>
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteError(''); }}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};

export default ProfilePage;
