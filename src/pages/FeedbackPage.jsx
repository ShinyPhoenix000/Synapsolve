import React, { useState } from 'react';

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: send feedback to backend
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>
      {submitted ? (
        <div className="text-green-600">Thank you for your feedback!</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
            rows={5}
            placeholder="Your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <div>
            <label className="block mb-1">Rating:</label>
            <select
              className="p-2 border rounded dark:bg-gray-800 dark:text-white"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1,2,3,4,5].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
        </form>
      )}
    </div>
  );
};

export default FeedbackPage;
