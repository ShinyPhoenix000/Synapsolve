import React, { useEffect, useState } from 'react';
import { activeCalendarService } from '../../services/calendarService';
import { useAuth } from '../../hooks/useAuth';

const MyCalendarTab: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'agent' && user.role !== 'admin')) return;
    setLoading(true);
    setError('');
    // Fetch upcoming events from Google Calendar
    (async () => {
      try {
        if (!activeCalendarService.isSignedIn()) {
          setError('Please connect your Google Calendar.');
          setLoading(false);
          return;
        }
        // List events for the next 7 days
        const now = new Date();
        const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const response = await window.gapi.client.calendar.events.list({
          calendarId: 'primary',
          timeMin: now.toISOString(),
          timeMax: weekAhead.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });
        setEvents(response.result.items || []);
      } catch (e) {
        setError('Failed to load calendar events.');
      }
      setLoading(false);
    })();
  }, [user]);

  if (!user || (user.role !== 'agent' && user.role !== 'admin')) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Calendar</h3>
      {loading ? (
        <div className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
      ) : error ? (
        <div className="text-red-500 dark:text-red-300">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-300">No upcoming ticket events.</div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.map(event => (
            <li key={event.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{event.summary}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : ''}</div>
                {event.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.description}</div>
                )}
              </div>
              {event.description && event.description.includes('/tickets/') && (
                <a
                  href={event.description.match(/https?:\/\/[^\s]+/g)?.[0] || '#'}
                  className="mt-2 md:mt-0 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  target="_blank" rel="noopener noreferrer"
                >
                  View Ticket
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyCalendarTab;
