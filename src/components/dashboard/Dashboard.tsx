import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import DashboardLayout from '../layout/DashboardLayout';
import { TicketForm } from '../tickets/TicketForm';
import { useNavigate } from 'react-router-dom';
import { LockOpen, RefreshCw, CheckCircle2, Users as UsersIcon } from 'lucide-react';
import { User } from '../../types';
import dayjs from 'dayjs';
import { runQuery } from '../../services/neo4jQuery';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [neo4jAgentStats, setNeo4jAgentStats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    let q;
    if (user.role === 'agent') {
      q = query(collection(db, 'tickets'), where('assignedAgentId', '==', user.uid));
    } else if (user.role === 'admin') {
      q = query(collection(db, 'tickets'));
    } else {
      q = query(collection(db, 'tickets'), where('submittedBy', '==', user.uid));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch available agents
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'agent'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAgents(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          role: data.role || 'agent',
          photoURL: data.photoURL,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          isOnline: data.isOnline,
          lastActive: data.lastActive?.toDate ? data.lastActive.toDate() : undefined,
        };
      }));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchNeo4jAgentStats() {
      // Only fetch for admin or agent
      if (!user || (user.role !== 'admin' && user.role !== 'agent')) return;
      // Cypher: Get agent workloads
      const cypher = `
        MATCH (a:Agent)
        OPTIONAL MATCH (a)-[:ASSIGNED_TO]->(t:Ticket)
        WITH a, COUNT(t) AS ticketCount
        RETURN a.uid AS uid, a.name AS name, ticketCount
        ORDER BY ticketCount DESC
      `;
      try {
        const result = await runQuery(cypher);
        setNeo4jAgentStats(result);
      } catch (err) {
        setNeo4jAgentStats([]);
      }
    }
    fetchNeo4jAgentStats();
  }, [user]);

  const today = dayjs();
  const unresolvedCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTodayCount = tickets.filter(t => t.status === 'resolved' && t.resolvedAt && dayjs(t.resolvedAt.toDate ? t.resolvedAt.toDate() : t.resolvedAt).isSame(today, 'day')).length;
  const availableAgentsCount = agents.length;

  const statCards = [
    {
      label: 'Unresolved Requests',
      icon: LockOpen,
      value: unresolvedCount,
      color: 'from-blue-500 to-blue-700',
      route: '/open-tickets',
      tooltip: 'Tickets that are still open and awaiting action.'
    },
    {
      label: 'Active Investigations',
      icon: RefreshCw,
      value: inProgressCount,
      color: 'from-yellow-400 to-yellow-600',
      route: '/in-progress',
      tooltip: 'Tickets currently being worked on by support.'
    },
    {
      label: "Today's Resolutions",
      icon: CheckCircle2,
      value: resolvedTodayCount,
      color: 'from-green-500 to-green-700',
      route: '/resolved-today',
      tooltip: 'Tickets resolved by agents today.'
    },
    {
      label: 'Available Support Agents',
      icon: UsersIcon,
      value: availableAgentsCount,
      color: 'from-purple-500 to-purple-700',
      route: '/active-agents',
      tooltip: 'Number of agents available to help.'
    },
  ];

  const filteredTickets = tickets.filter(ticket =>
    filter === 'all' ? true : ticket.status === filter
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center min-h-[60vh] p-6 w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Dashboard</h1>
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mb-8">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => navigate(card.route)}
                className={
                  `group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow hover:shadow-md hover:border-blue-400 dark:hover:border-blue-400 transition-all flex flex-col items-center py-4 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400 relative min-h-[110px] min-w-[120px]`
                }
                title={card.tooltip}
                tabIndex={0}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 mb-2">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 mb-0.5">{card.value}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 text-center leading-tight">{card.label}</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-zinc-800/90 px-2 py-1 rounded shadow pointer-events-none transition-opacity">{card.tooltip}</span>
              </button>
            );
          })}
        </div>
        {/* For customers, show submit form */}
        {user?.role === 'user' && (
          <div className="w-full max-w-xl mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-4">Submit Ticket</h2>
            <TicketForm />
          </div>
        )}
        {/* Ticket Table with Filters */}
        <div className="w-full max-w-5xl">
          <div className="flex gap-2 mb-4">
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
        {/* Agent Workload Stats (Admin/Agent) */}
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {neo4jAgentStats.map(agent => (
              <div key={agent.uid} className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{agent.name || agent.uid}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Tickets Assigned:</strong> {agent.ticketCount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;