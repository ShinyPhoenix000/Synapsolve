// src/services/ticketService.ts
import { doc, updateDoc, Timestamp, addDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { runQuery } from './neo4jQuery';
import { Ticket, User } from '../types';
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent, activeCalendarService } from './calendarService';
import { addNotification } from './notificationService';
import { updateAgentTicketCount } from '../utils/neo4jAgentUtils';

export async function notifyUser(userId: string, message: string) {
  await addNotification(userId, message);
}

// Notify all admins
export async function notifyAdmins(message: string) {
  const adminsSnap = await getDocs(collection(db, 'users'));
  adminsSnap.forEach((docSnap) => {
    const user = docSnap.data();
    if (user.role === 'admin') {
      notifyUser(docSnap.id, message);
    }
  });
}

export const resolveTicket = async (ticketId: string) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, {
    status: "resolved",
    resolvedAt: Timestamp.now(),
  });
  const ticketSnap = await getDoc(ticketRef);
  const ticketData = ticketSnap.exists() ? ticketSnap.data() : null;
  if (ticketData && ticketData.calendarEventId) {
    await updateCalendarEvent({
      id: ticketId,
      title: ticketData.title,
      description: ticketData.description,
      assignedTo: ticketData.assignedTo,
      dueDate: ticketData.dueDate,
      createdAt: ticketData.createdAt,
      link: window.location.origin + '/tickets/' + ticketId
    });
  }
  // Notify agent, submitter, and admins
  if (ticketData) {
    if (ticketData.assignedTo) await notifyUser(ticketData.assignedTo, `Ticket #${ticketId} marked as resolved.`);
    if (ticketData.submitter) await notifyUser(ticketData.submitter, `Your ticket #${ticketId} has been resolved.`);
    await notifyAdmins(`Ticket #${ticketId} was resolved.`);
  }
};

export const deleteTicket = async (ticketId: string) => {
  const ticketRef = doc(db, 'tickets', ticketId);
  const ticketSnap = await getDoc(ticketRef);
  const ticketData = ticketSnap.exists() ? ticketSnap.data() : null;
  if (ticketData && ticketData.calendarEventId) {
    await deleteCalendarEvent(ticketId);
  }
  // Notify agent, submitter, and admins
  if (ticketData) {
    if (ticketData.assignedTo) await notifyUser(ticketData.assignedTo, `Ticket #${ticketId} was deleted.`);
    if (ticketData.submitter) await notifyUser(ticketData.submitter, `Your ticket #${ticketId} was deleted.`);
    await notifyAdmins(`Ticket #${ticketId} was deleted.`);
  }
  // ...existing code to delete ticket from Firestore...
};

export const reassignTicket = async (ticketId: string, newAgentId: string) => {
  const ticketRef = doc(db, 'tickets', ticketId);
  await updateDoc(ticketRef, { assignedTo: newAgentId });
  const ticketSnap = await getDoc(ticketRef);
  const ticketData = ticketSnap.exists() ? ticketSnap.data() : null;
  if (ticketData && ticketData.calendarEventId) {
    await updateCalendarEvent({
      id: ticketId,
      title: ticketData.title,
      description: ticketData.description,
      assignedTo: newAgentId,
      dueDate: ticketData.dueDate,
      createdAt: ticketData.createdAt,
      link: window.location.origin + '/tickets/' + ticketId
    });
  }
  // Notify new agent and admins
  if (ticketData) {
    await notifyUser(newAgentId, `Ticket #${ticketId} has been assigned to you.`);
    await notifyAdmins(`Ticket #${ticketId} was reassigned to a new agent.`);
  }
};

// Assign agent to ticket using Neo4j
export const assignAgentToTicket = async (ticketId: string, description: string) => {
  // 1. Find least busy agent in Neo4j
  const agentQuery = `
    MATCH (a:Agent)
    OPTIONAL MATCH (a)-[:ASSIGNED_TO]->(t:Ticket)
    WITH a, COUNT(t) AS ticketCount
    RETURN a, ticketCount
    ORDER BY ticketCount ASC
    LIMIT 1
  `;
  const agentResult = await runQuery(agentQuery);
  if (!agentResult || agentResult.length === 0) throw new Error('No agent found');
  const agent = agentResult[0].a.properties;

  // 2. Create ticket node in Neo4j
  const createTicketQuery = `
    MERGE (t:Ticket {id: $ticketId, description: $description})
    RETURN t
  `;
  await runQuery(createTicketQuery, { ticketId: ticketId, description: description });

  // 3. Assign agent to ticket in Neo4j
  const agentId = agent.uid || agent.id;
  console.log('Assigning agent to ticket:', { agentId, ticketId });
  if (!agentId || !ticketId) throw new Error('Missing agentId or ticketId for assignment');
  const assignQuery = `
    MATCH (a:Agent {uid: $agentId}), (t:Ticket {id: $ticketId})
    MERGE (a)-[:ASSIGNED_TO]->(t)
    RETURN a, t
  `;
  await runQuery(assignQuery, { agentId, ticketId });

  // 4. Link similar tickets (RELATED_TO)
  const linkQuery = `
    MATCH (t1:Ticket {id: $ticketId}), (t2:Ticket)
    WHERE t1.id <> t2.id AND t1.description CONTAINS t2.description
    MERGE (t1)-[:RELATED_TO]->(t2)
    RETURN t1, t2
  `;
  await runQuery(linkQuery, { ticketId: ticketId });

  // 5. Update Firestore with assigned agent
  const ticketRef = doc(db, 'tickets', ticketId);
  await updateDoc(ticketRef, { assignedTo: agentId, assignedToName: agent.name || agent.displayName });

  // 6. Create Google Calendar event and store eventId
  const ticketSnap = await getDoc(ticketRef);
  const ticketData = ticketSnap.exists() ? ticketSnap.data() : null;
  if (ticketData) {
    let createdAt: Date;
    if (ticketData.createdAt instanceof Date) {
      createdAt = ticketData.createdAt;
    } else if (ticketData.createdAt && ticketData.createdAt.toDate) {
      createdAt = ticketData.createdAt.toDate();
    } else if (typeof ticketData.createdAt === 'string' || typeof ticketData.createdAt === 'number') {
      createdAt = new Date(ticketData.createdAt);
    } else {
      createdAt = new Date();
    }
    if (typeof activeCalendarService !== 'undefined' && typeof activeCalendarService.initialize === 'function') {
      await activeCalendarService.initialize();
    }
    const eventId = await createCalendarEvent({
      id: ticketId,
      title: ticketData.title,
      description: ticketData.description,
      assignedTo: agent.id,
      dueDate: ticketData.dueDate,
      createdAt,
      link: window.location.origin + '/tickets/' + ticketId
    });
    if (eventId) {
      await updateDoc(ticketRef, { calendarEventId: eventId });
    }
  }
  return agent;
};

/**
 * Create a ticket and assign to least-busy agent (Firestore only)
 * @param ticketData - ticket fields (title, description, priority, category, currentUser info)
 * @returns Firestore document reference
 */
export const createTicket = async (ticketData: {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  submittedBy: string;
  submittedByName: string;
}) => {
  // Find least-busy agent in Firestore
  const agentsSnap = await getDocs(collection(db, 'users'));
  let leastBusyAgent: User & { id: string } | null = null;
  let minTickets = Infinity;
  agentsSnap.forEach((docSnap) => {
    const user = docSnap.data() as User;
    if (user.role === 'agent') {
      const ticketCount = (user as any).ticketCount || 0;
      if (ticketCount < minTickets) {
        minTickets = ticketCount;
        leastBusyAgent = { ...user, id: docSnap.id };
      }
    }
  });
  if (!leastBusyAgent) throw new Error('No agent found');

  // Create ticket in Firestore with assignment fields
  const docRef = await addDoc(collection(db, 'tickets'), {
    title: ticketData.title,
    description: ticketData.description,
    priority: ticketData.priority,
    category: ticketData.category,
    status: 'open',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    submittedBy: ticketData.submittedBy,
    submittedByName: ticketData.submittedByName,
    assignedAgentId: leastBusyAgent.id,
    assignedAgentName: leastBusyAgent.displayName,
    assignedAgentEmail: leastBusyAgent.email,
  });
  // Optionally update agent's ticketCount in Firestore
  const agentRef = doc(db, 'users', leastBusyAgent.id);
  await updateDoc(agentRef, { ticketCount: minTickets + 1 });
  return docRef;
};

// Example usage for resolveTicket and reassignTicket:
// await updateAgentTicketCount(agentId, -1); // when resolved or unassigned
// await updateAgentTicketCount(newAgentId, 1); // when reassigned