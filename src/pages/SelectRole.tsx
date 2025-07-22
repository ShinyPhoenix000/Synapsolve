import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createAgentInNeo4j } from '../services/neo4jService';
import { collection, setDoc as setDocFS } from 'firebase/firestore';

const roles = [
  { value: 'customer', label: 'Customer' },
  { value: 'internal', label: 'Internal User' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'manager', label: 'Manager' },
  { value: 'agent', label: 'Agent' },
];

const SelectRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !user) return;
    setLoading(true);
    await setDoc(doc(db, 'users', user.uid), {
      name: user.displayName,
      email: user.email,
      role,
    }, { merge: true });
    // If the selected role is 'agent', create an Agent node in Neo4j
    if (role === 'agent') {
      await createAgentInNeo4j({
        uid: user.uid,
        displayName: user.displayName || user.email || '',
        email: user.email || '',
      });
      // Persist agent in Firestore for persistence
      await setDocFS(doc(db, 'agents', user.uid), {
        uid: user.uid,
        displayName: user.displayName || user.email || '',
        email: user.email || '',
        skills: [],
        currentLoad: 0,
        maxLoad: 5,
        isAvailable: true,
        seniorLevel: false
      });
    }
    setLoading(false);
    // Redirect to dashboard for all roles
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-200">Select Your Role</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          {roles.map(r => (
            <label key={r.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                className="form-radio h-5 w-5 text-blue-600"
                required
              />
              <span className="text-lg">{r.label}</span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default SelectRole;
