import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import BackButton from '../components/common/BackButton';

const SubmitFeedbackPage = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, 'feedback'), { message, created: Date.now() });
    setLoading(false);
    setSuccess(true);
    setMessage('');
  };

  return (
    <div className="relative max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <BackButton className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition" aria-label="Back to Dashboard" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 mt-8 text-center">Submit Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white text-gray-900 resize-none min-h-[120px]"
          rows={5}
          placeholder="Your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        {success && <div className="text-green-600 dark:text-green-300 text-center">Thank you for your feedback!</div>}
      </form>
    </div>
  );
};

export default SubmitFeedbackPage;
