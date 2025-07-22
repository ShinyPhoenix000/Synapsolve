import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { resolveTicket } from '../services/ticketService';
import { useAuth } from '../hooks/useAuth';
import BackButton from '../components/common/BackButton';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  sentiment: string;
  submitter: string;
  createdAt: string;
  resolvedAt?: string;
  description: string;
  summary?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentEmail?: string;
  suggestedReply?: string; // <-- add this line
}

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTicket = async () => {
      try {
        const ref = doc(db, 'tickets', id);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTicket({
            id: snapshot.id,
            title: data.title,
            status: data.status,
            priority: data.priority,
            sentiment: data.sentiment,
            submitter: data.submittedByName || data.submitter || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : '',
            resolvedAt: data.resolvedAt?.toDate ? data.resolvedAt.toDate().toLocaleString() : undefined,
            description: data.description,
            summary: data.aiSummary || '',
            assignedTo: data.assignedTo || '',
            assignedToName: data.assignedToName || '',
            assignedAgentId: data.assignedAgentId || '',
            assignedAgentName: data.assignedAgentName || '',
            assignedAgentEmail: data.assignedAgentEmail || '',
            suggestedReply: data.suggestedReply || '',
          });
          // Show toast with suggestedReply if present
          if (data.suggestedReply) {
            toast(
              <div>
                <strong>AI Suggested Reply:</strong>
                <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">{data.suggestedReply}</div>
              </div>,
              { icon: '🤖', duration: 9000 }
            );
          }
        } else {
          setTicket(null);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleResolve = async () => {
    if (!ticket) return;
    try {
      await resolveTicket(ticket.id);
      toast.success('Ticket marked as resolved.');
      setTicket({
        ...ticket,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
      toast.error('Something went wrong while resolving the ticket.');
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-300">Loading ticket...</p>;
  if (!ticket) return <p className="text-center mt-10 text-red-500 dark:text-red-300">Ticket not found.</p>;

  // Role-based access: Only assigned agent or admin can resolve
  const canResolve =
    user?.role === 'admin' ||
    (user?.role === 'agent' && ticket && ticket.assignedAgentId === user.uid);

  // Customers can only view their own tickets
  if (user?.role === 'user' && ticket && ticket.submitter !== user.uid) {
    return <p className="text-center mt-10 text-red-500 dark:text-red-300">Access denied. This ticket does not belong to you.</p>;
  }

  // Secure role-based ticket visibility for detail view
  if (
    user &&
    user.role !== 'admin' &&
    ticket &&
    ticket.submitter !== user.uid &&
    ticket.assignedAgentId !== user.uid
  ) {
    return <p className="text-center mt-10 text-red-500 dark:text-red-300">Access denied. You do not have permission to view this ticket.</p>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="pt-6 px-4 sm:px-8">
        <BackButton className="static mb-4" />
      </div>
      <main className="flex-1 flex items-center justify-center px-2 py-6">
        <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8 mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-2">Details</h2>
          {/* Assigned Agent Card for agents/admins */}
          {(user?.role === 'agent' || user?.role === 'admin') && ticket.assignedAgentName && (
            <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex flex-col gap-1">
              <span className="font-semibold text-gray-800 dark:text-gray-100 text-base">Assigned Agent</span>
              <span className="text-sm text-gray-700 dark:text-gray-200">{ticket.assignedAgentName}</span>
              {ticket.assignedAgentEmail && <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.assignedAgentEmail}</span>}
            </div>
          )}
          <div className="space-y-3 text-base sm:text-lg text-gray-800 dark:text-gray-100">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <span><strong>ID:</strong> {ticket.id}</span>
              <span><strong>Status:</strong> {ticket.status}</span>
              <span><strong>Priority:</strong> {ticket.priority}</span>
              <span><strong>Sentiment:</strong> {ticket.sentiment}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <span><strong>Submitter:</strong> {ticket.submitter}</span>
              <span><strong>Created At:</strong> <span className="text-gray-600 dark:text-gray-300">{ticket.createdAt}</span></span>
              {ticket.resolvedAt && (
                <span><strong>Resolved At:</strong> <span className="text-gray-600 dark:text-gray-300">{ticket.resolvedAt}</span></span>
              )}
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base sm:text-lg mt-1">{ticket.description}</p>
            </div>
            {ticket.summary && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">AI Summary</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base sm:text-lg mt-1">{ticket.summary}</p>
              </div>
            )}
            {ticket.suggestedReply && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">AI Suggested Reply</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base sm:text-lg mt-1">{ticket.suggestedReply}</p>
                </div>
              </div>
            )}
          </div>
          {ticket.status !== 'resolved' && canResolve && (
            <button
              onClick={handleResolve}
              className="mt-8 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow"
            >
              Mark as Resolved
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default TicketDetailPage;