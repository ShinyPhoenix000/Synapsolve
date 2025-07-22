import { runQuery } from '../services/neo4jQuery';

/**
 * Increment or decrement an agent's ticketCount in Neo4j
 * @param agentId string
 * @param increment number (+1 or -1)
 */
export async function updateAgentTicketCount(agentId: string, increment: number) {
  const cypher = `
    MATCH (a:Agent {uid: $agentId})
    SET a.ticketCount = coalesce(a.ticketCount, 0) + $increment
    RETURN a
  `;
  await runQuery(cypher, { agentId, increment });
}
