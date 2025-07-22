import React from 'react';
import { Link } from 'react-router-dom';

const mockAgents = [
  { name: 'Alice', avatar: '', resolved: 5 },
  { name: 'Bob', avatar: '', resolved: 3 },
  { name: 'Charlie', avatar: '', resolved: 7 },
];

const AgentsPage = () => (
  <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
    <div className="flex items-center mb-4">
      <Link to="/dashboard" className="mr-2 text-blue-600 hover:underline text-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
        ← Back to Home
      </Link>
      <h2 className="text-2xl font-bold">Agents Active Today</h2>
    </div>
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {mockAgents.map((agent, i) => (
        <li key={i} className="py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold">
            {agent.avatar ? <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full" /> : agent.name[0]}
          </div>
          <div>
            <div className="font-medium">{agent.name}</div>
            <div className="text-xs text-gray-500">Tickets Resolved Today: {agent.resolved}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default AgentsPage;
