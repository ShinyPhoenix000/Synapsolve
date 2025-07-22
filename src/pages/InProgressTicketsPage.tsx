import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import BackButton from '../components/common/BackButton';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const InProgressTicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Get searchQuery from Layout via Outlet context
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { user } = useAuth();

  useEffect(() => {
    const fetchInProgressTickets = async () => {
      let q;
      if (user?.role === 'user') {
        q = query(collection(db, 'tickets'), where('status', '==', 'in-progress'), where('submittedBy', '==', user.uid));
      } else if (user?.role === 'agent') {
        q = query(collection(db, 'tickets'), where('status', '==', 'in-progress'), where('assignedAgentId', '==', user.uid));
      } else {
        q = query(collection(db, 'tickets'), where('status', '==', 'in-progress'));
      }
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(data);
      setLoading(false);
    };

    if (user) fetchInProgressTickets();
  }, [user]);

  // Secure role-based visibility filter
  const visibleTickets = tickets.filter(ticket =>
    user?.role === 'admin' ||
    ticket.submittedBy === user?.uid ||
    ticket.assignedAgentId === user?.uid
  );
  // Filter tickets by search query and status after visibility
  const filteredTickets = !searchQuery
    ? visibleTickets
    : visibleTickets.filter(ticket => {
        const q = searchQuery.toLowerCase();
        return (
          (ticket.title && ticket.title.toLowerCase().includes(q)) ||
          (ticket.description && ticket.description.toLowerCase().includes(q)) ||
          (ticket.category && ticket.category.toLowerCase().includes(q)) ||
          (ticket.priority && ticket.priority.toLowerCase().includes(q)) ||
          (ticket.status && ticket.status.toLowerCase().includes(q)) ||
          (ticket.submitterName && ticket.submitterName.toLowerCase().includes(q))
        );
      });

  return (
    <div className="relative p-6 max-w-5xl mx-auto">
      <BackButton className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition" label="Back to Dashboard" />
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Tickets In Progress</h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">No tickets are currently in progress.</p>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-200">{ticket.description}</p>
              <Link to={`/tickets/${ticket.id}`} className="text-blue-500 dark:text-blue-200 hover:underline mt-2 block">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InProgressTicketsPage;