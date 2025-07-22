import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import BackButton from '../components/common/BackButton';
import { useOutletContext } from 'react-router-dom';

const ActiveAgentsPage = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Get searchQuery from Layout via Outlet context
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  useEffect(() => {
    const fetchActiveAgents = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'agent'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(data);
      setLoading(false);
    };

    fetchActiveAgents();
  }, []);

  // Filter agents by search query
  const filteredAgents = !searchQuery
    ? agents
    : agents.filter(agent => {
        const q = searchQuery.toLowerCase();
        return (
          (agent.displayName && agent.displayName.toLowerCase().includes(q)) ||
          (agent.email && agent.email.toLowerCase().includes(q))
        );
      });

  return (
    <div className="relative p-6 max-w-5xl mx-auto">
      <BackButton className="absolute top-0 left-0 mt-2 ml-2" label="Back to Dashboard" />
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-200 mb-8">Active Agents</h2>
      {loading ? (
        <p>Loading...</p>
      ) : filteredAgents.length === 0 ? (
        <p className="text-gray-500">No active agents found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredAgents.map(agent => (
            <li key={agent.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <div className="font-semibold text-gray-900 dark:text-white">{agent.displayName || agent.email}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{agent.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActiveAgentsPage;