import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import BackButton from '../components/common/BackButton';

const AssignedTicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const fetchTickets = async () => {
      const q = query(collection(db, 'tickets'), where('assignedTo', '==', user.email));
      const snapshot = await getDocs(q);
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchTickets();
  }, [user]);

  if (user?.role !== 'agent') {
    return <div className="text-center mt-10 text-red-500">Access denied. Agents only.</div>;
  }

  return (
    <div className="relative p-6 max-w-5xl mx-auto">
      <BackButton className="absolute top-0 left-0 mt-2 ml-2" label="Back to Dashboard" />
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-200 mb-8">My Assigned Tickets</h2>
      {loading ? (
        <p>Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No tickets assigned to you.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ticket.title}</h3>
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

export default AssignedTicketsPage;
