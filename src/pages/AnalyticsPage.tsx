import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { runQuery } from '../services/neo4jQuery';
import { Ticket } from '../types';
import BackButton from '../components/common/BackButton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

const AnalyticsPage = () => {
  // Firebase state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  // Neo4j state
  const [agentLoad, setAgentLoad] = useState<any[]>([]);
  const [duplicateGraph, setDuplicateGraph] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 1. Fetch tickets from Firestore
      const snapshot = await getDocs(collection(db, 'tickets'));
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket)));
      // 2. Fetch agent load from Neo4j
      const agentLoadCypher = `MATCH (a:Agent)-[:ASSIGNED_TO]->(t:Ticket) RETURN a.name AS agent, count(t) AS count`;
      setAgentLoad(await runQuery(agentLoadCypher));
      // 3. Fetch duplicate ticket network from Neo4j
      const dupCypher = `MATCH (t1:Ticket)-[:RELATED_TO]->(t2:Ticket) RETURN t1, t2`;
      setDuplicateGraph(await runQuery(dupCypher));
      setLoading(false);
    };
    fetchData();
  }, []);

  // 1. Ticket Volume Over Time (grouped by day)
  const volumeByDay = tickets.reduce((acc, t) => {
    const d = new Date(t.createdAt).toLocaleDateString();
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const volumeData = Object.entries(volumeByDay).map(([date, count]) => ({ date, count }));

  // 2. Ticket Status Distribution
  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // 3. Agent Ticket Load (Neo4j)
  const agentLoadData = agentLoad.map((a: any) => ({ agent: a.agent, count: a.count }));

  // 4. Top Ticket Categories
  const catCounts = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const catData = Object.entries(catCounts).map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value).slice(0, 8);

  // 5. Ticket Sentiment Analysis
  const sentimentCounts = tickets.reduce((acc, t) => {
    if (t.sentiment) {
      acc[t.sentiment] = (acc[t.sentiment] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const sentimentData = [
    { name: 'Positive', value: sentimentCounts['positive'] || 0 },
    { name: 'Neutral', value: sentimentCounts['neutral'] || 0 },
    { name: 'Negative', value: sentimentCounts['negative'] || 0 },
  ];

  // 6. Duplicate Ticket Network Graph (Neo4j)
  // We'll render a simple force-directed graph using d3-force-graph if available, else fallback to JSON

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="relative flex items-center mb-8">
        <BackButton className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition" />
        <h2 className="text-3xl font-bold text-center w-full text-gray-900 dark:text-gray-100">Analytics Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Ticket Volume Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">📈 Ticket Volume Over Time</h3>
          {loading ? <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* 2. Ticket Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">🧾 Ticket Status Distribution</h3>
          {loading ? <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* 3. Agent Ticket Load */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">👨‍💻 Agent Ticket Load</h3>
          {loading ? <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agentLoadData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="agent" type="category" stroke="#888" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* 4. Top Ticket Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">🗂️ Top Ticket Categories</h3>
          {loading ? <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="value" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* 5. Ticket Sentiment Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">😀 Ticket Sentiment Analysis</h3>
          {loading ? <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sentimentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* 6. Duplicate Ticket Network Graph */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 col-span-1 md:col-span-2">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">🔄 Duplicate Ticket Network Graph</h3>
          {loading ? <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" /> : (
            <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto max-h-64">{JSON.stringify(duplicateGraph, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
