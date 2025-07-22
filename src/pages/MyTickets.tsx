import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import DashboardLayout from '../components/layout/DashboardLayout';
import { TicketForm } from '../components/tickets/TicketForm';

const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Debug: log user
  console.log('MyTickets user:', user);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Please log in to view your tickets.</h1>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    let q;
    if (user.role === 'agent') {
      q = query(collection(db, 'tickets'), where('assignedAgentId', '==', user.uid));
    } else {
      q = query(collection(db, 'tickets'), where('submittedBy', '==', user.uid));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredTickets = tickets.filter(ticket =>
    filter === 'all' ? true : ticket.status === filter
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-6">My Tickets</h1>
        <div className="flex gap-2 mb-6">
          {['all', 'open', 'in-progress', 'resolved'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-2 rounded font-medium transition text-sm ${filter === opt ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-100'}`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
        <div className="w-full max-w-xl mb-8">
          <TicketForm />
        </div>
        <div className="w-full max-w-2xl">
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td></tr>
                ) : filteredTickets.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No tickets found under this filter.</td></tr>
                ) : (
                  filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition">
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{ticket.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{ticket.title}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'} dark:bg-opacity-20`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{ticket.priority}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-zinc-300 whitespace-nowrap">{ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTickets;
