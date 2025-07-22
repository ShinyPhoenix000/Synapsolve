import React, { useState } from 'react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmationText: string) => void;
  loading: boolean;
  error: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm, loading, error }) => {
  const [confirmation, setConfirmation] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Delete Account</h2>
        <p className="mb-2 text-gray-800 dark:text-gray-200 font-semibold">Are you sure you want to delete your account? <span className="text-red-600">This action is irreversible.</span></p>
        <ul className="mb-4 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
          <li>Your tickets and data will be permanently deleted.</li>
          <li>You will be signed out immediately.</li>
          <li>Linked services (e.g., Google Calendar) will be disconnected.</li>
        </ul>
        <div className="mb-4">
          <label htmlFor="delete-confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type <span className="font-mono font-bold">DELETE</span> to confirm:
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={confirmation}
            onChange={e => setConfirmation(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
            disabled={loading}
            autoFocus
          />
        </div>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition disabled:opacity-60"
            onClick={() => onConfirm(confirmation)}
            disabled={confirmation !== 'DELETE' || loading}
          >
            {loading ? 'Deleting...' : 'Yes, Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
