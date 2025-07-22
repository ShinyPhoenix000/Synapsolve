import { runQuery } from '../services/neo4jQuery';

/**
 * 1. Auto-assign ticket to agent based on expertise
 *    - Match the ticket topic to an agent with EXPERT_IN relation
 *    - Return the top agent with least active tickets
 *
 * 2. Agent Activity Leaderboard
 *    - Count number of resolved tickets per agent
 *    - Sort by count descending and return top 5 agents
 *
 * 3. Ticket-Agent Graph Query
 *    - Return nodes and relationships between Tickets, Topics, and Agents
 *    - Useful for D3 or Neovis.js visualizations
 */

export const autoAssignAgent = async (ticketTopic: string) => {
  const query = `
    MATCH (t:Topic {name: $topic})<-[:EXPERT_IN]-(a:Agent)
    OPTIONAL MATCH (a)-[:ASSIGNED_TO]->(tk:Ticket)
    WITH a, COUNT(tk) AS ticketCount
    RETURN a.name AS name, a.email AS email
    ORDER BY ticketCount ASC
    LIMIT 1
  `;
  return await runQuery(query, { topic: ticketTopic });
};

export const getTopAgents = async () => {
  const query = `
    MATCH (a:Agent)-[:RESOLVED]->(t:Ticket)
    RETURN a.name AS name, COUNT(t) AS resolvedCount
    ORDER BY resolvedCount DESC
    LIMIT 5
  `;
  return await runQuery(query);
};

export const getAgentTicketGraph = async () => {
  const query = `
    MATCH (t:Ticket)-[:RELATED_TO]->(topic:Topic)<-[:EXPERT_IN]-(a:Agent)
    RETURN t, topic, a
    LIMIT 50
  `;
  return await runQuery(query);
};

export const getTicketsResolvedPerAgentOverTime = async () => {
  const query = `
    MATCH (a:Agent)-[:RESOLVED]->(t:Ticket)
    WITH a, t, date(t.resolvedAt) AS resolvedDate
    RETURN a.name AS name, resolvedDate, COUNT(t) AS resolvedCount
    ORDER BY resolvedDate ASC
  `;
  return await runQuery(query);
};
