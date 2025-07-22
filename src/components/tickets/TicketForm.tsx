import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, CheckCircle } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { generateAISummary } from '../../services/mockServices';
import { findBestAgent, syncAgentsFromFirestore } from '../../services/neo4jService';
import { activeCalendarService } from '../../services/calendarService';
import { addNotification } from '../../services/notificationService';
import { autoAssignAgent } from '../../services/neo4jAdvanced';
import { assignAgentToTicket } from '../../services/ticketService';
import { Ticket } from '../../types';
import toast from 'react-hot-toast';

export const TicketForm: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const categories = [
    'Technical Support',
    'Billing',
    'Account Issues',
    'Feature Request',
    'Bug Report',
    'General Inquiry'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Always sync agents from Firestore before assignment
      await syncAgentsFromFirestore();
      // Generate AI summary and sentiment
      const aiAnalysis = await generateAISummary(formData.title, formData.description);
      console.log('🤖 AI Analysis completed:', aiAnalysis);

      // Create ticket object
      const newTicket: Omit<Ticket, 'id'> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'open',
        submitter: user.uid,
        submitterName: user.displayName || user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        aiSummary: aiAnalysis.summary,
        sentiment: aiAnalysis.sentiment,
        suggestedReply: aiAnalysis.suggestedReply
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'tickets'), newTicket);
      // Fetch the ticket to get assigned agent name
      const createdSnap = await import('firebase/firestore').then(fb => fb.getDoc(docRef));
      let assignedAgentName = '';
      if (createdSnap.exists()) {
        const data = createdSnap.data();
        assignedAgentName = data?.assignedAgentName || data?.assignedToName || '';
      }
      setTicketId(docRef.id);
      setSubmitted(true);
      if (assignedAgentName) {
        toast.success(`Ticket assigned to Agent ${assignedAgentName}`);
      } else {
        toast.success('Ticket submitted successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

      // Post-creation steps (agent assignment, notification, calendar)
      try {
        await assignAgentToTicket(docRef.id, formData.description);
        const ticketWithId: Ticket = { ...newTicket, id: docRef.id };
        let agent = null;
        try {
          const neo4jResult = await autoAssignAgent(formData.category);
          if (Array.isArray(neo4jResult) && neo4jResult.length > 0) {
            agent = {
              displayName: neo4jResult[0].name,
              email: neo4jResult[0].email,
              uid: '',
            };
          }
        } catch (e) {
          console.warn('Neo4j auto-assign failed, falling back to local logic.');
        }
        if (!agent) {
          agent = await findBestAgent(ticketWithId);
        }
        if (agent) {
          await updateDoc(doc(db, 'tickets', docRef.id), {
            assignedTo: agent.uid || '',
            assignedToName: agent.displayName || (agent as any).name || ''
          });
          // Create Google Calendar event for agent
          const reminderDate = new Date();
          reminderDate.setHours(reminderDate.getHours() + 24);
          await activeCalendarService.createTicketReminder(
            docRef.id,
            formData.title,
            agent.email,
            reminderDate
          );
          // Notify agent
          await addNotification(
            agent.uid || '',
            `New Ticket Assigned: ${formData.title}`
          );
        }
      } catch (postError) {
        console.error('Ticket post-creation step failed:', postError);
        toast('Ticket submitted, but some automations failed.', { icon: '⚠️' });
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ticket Submitted Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your ticket has been received and processed by our AI system.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Ticket ID:</strong> {ticketId}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            You'll receive an email notification once an agent is assigned to your case.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSubmitted(false)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Submit Another Ticket
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-2xl p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Submit a Support Ticket
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Describe your issue and our AI-powered system will route it to the best agent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Brief description of your issue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Please provide detailed information about your issue..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
              required
            >
              <option value="" className="placeholder-gray-400 dark:placeholder-gray-500">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || !formData.title || !formData.description || !formData.category}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Processing with AI...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Ticket</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};