// Neo4j Service for Agent Routing
// This is a mock implementation that can be replaced with actual Neo4j integration
import { env } from '../config/env';
import neo4j from 'neo4j-driver';

import { Agent, Ticket } from '../types';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
}

// Neo4j configuration from environment variables
const neo4jConfig: Neo4jConfig = {
  uri: env.neo4j.uri,
  username: env.neo4j.username,
  password: env.neo4j.password
};

// Initialize Neo4j driver
const driver = neo4j.driver(
  neo4jConfig.uri,
  neo4j.auth.basic(neo4jConfig.username, neo4jConfig.password)
);

const getSession = () => driver.session();

/**
 * Create an Agent node in Neo4j
 */
export const createAgentInNeo4j = async (agent: {
  uid: string;
  displayName: string;
  email: string;
}) => {
  const session = getSession();
  try {
    await session.run(
      `MERGE (a:Agent {uid: $uid})
       REMOVE a.id
       SET a.uid = $uid, a.displayName = $displayName, a.email = $email, a.skills = [], a.currentLoad = 0, a.maxLoad = 5, a.isAvailable = true, a.seniorLevel = false`,
      {
        uid: agent.uid,
        displayName: agent.displayName,
        email: agent.email
      }
    );
    console.log(`✅ Agent node created in Neo4j: ${agent.displayName}`);
  } finally {
    await session.close();
  }
};

/**
 * Get all agents from Neo4j
 */
export const getAllAgentsFromNeo4j = async (): Promise<Agent[]> => {
  const session = getSession();
  try {
    const result = await session.run('MATCH (a:Agent) RETURN a');
    return result.records.map(record => {
      const a = record.get('a').properties;
      return {
        uid: a.uid,
        displayName: a.displayName,
        email: a.email,
        skills: a.skills || [],
        currentLoad: a.currentLoad?.toNumber ? a.currentLoad.toNumber() : a.currentLoad || 0,
        maxLoad: a.maxLoad?.toNumber ? a.maxLoad.toNumber() : a.maxLoad || 5,
        isAvailable: a.isAvailable !== false,
        seniorLevel: a.seniorLevel || false
      };
    });
  } finally {
    await session.close();
  }
}

// Mock agent data with skills and workload
const mockAgents: Agent[] = [
  {
    uid: 'agent-1',
    email: 'sarah.tech@synapsolve.com',
    displayName: 'Sarah Chen',
    skills: ['Technical Support', 'Bug Report', 'API Issues'],
    currentLoad: 3,
    maxLoad: 8,
    isAvailable: true,
    seniorLevel: true
  },
  {
    uid: 'agent-2', 
    email: 'mike.billing@synapsolve.com',
    displayName: 'Mike Rodriguez',
    skills: ['Billing', 'Account Issues', 'Payments'],
    currentLoad: 2,
    maxLoad: 6,
    isAvailable: true,
    seniorLevel: false
  },
  {
    uid: 'agent-3',
    email: 'emma.support@synapsolve.com', 
    displayName: 'Emma Johnson',
    skills: ['General Inquiry', 'Feature Request', 'Account Issues'],
    currentLoad: 1,
    maxLoad: 5,
    isAvailable: true,
    seniorLevel: false
  },
  {
    uid: 'agent-4',
    email: 'david.senior@synapsolve.com',
    displayName: 'David Kim',
    skills: ['Technical Support', 'Bug Report', 'Feature Request', 'Escalation'],
    currentLoad: 4,
    maxLoad: 10,
    isAvailable: true,
    seniorLevel: true
  }
];

export const findBestAgent = async (
  ticket: Ticket
): Promise<Agent | null> => {
  try {
    const agentsWithCapacity = (await getAllAgentsFromNeo4j()).filter(agent =>
      agent.isAvailable && agent.currentLoad < agent.maxLoad
    );
    if (agentsWithCapacity.length === 0) {
      console.log('❌ No agents available with capacity');
      return null;
    }
    // Priority routing for negative sentiment or urgent tickets
    if (ticket.sentiment === 'negative' || ticket.priority === 'urgent') {
      const seniorAgents = agentsWithCapacity.filter(agent => agent.seniorLevel);
      if (seniorAgents.length > 0) {
        return seniorAgents.sort((a, b) => a.currentLoad - b.currentLoad)[0];
      }
    }
    // Skill-based matching
    const skillMatchedAgents = agentsWithCapacity.filter(agent =>
      agent.skills.some(skill =>
        ticket.category.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(ticket.category.toLowerCase())
      )
    );
    if (skillMatchedAgents.length > 0) {
      return skillMatchedAgents.sort((a, b) => {
        const aSkillScore = a.skills.filter((skill: string) =>
          ticket.category.toLowerCase().includes(skill.toLowerCase())
        ).length;
        const bSkillScore = b.skills.filter((skill: string) =>
          ticket.category.toLowerCase().includes(skill.toLowerCase())
        ).length;
        if (aSkillScore !== bSkillScore) {
          return bSkillScore - aSkillScore;
        }
        return a.currentLoad - b.currentLoad;
      })[0];
    }
    // Fallback to agent with lowest workload
    return agentsWithCapacity.sort((a, b) => a.currentLoad - b.currentLoad)[0];
  } catch (error) {
    console.error('❌ Neo4j routing error:', error);
    return null;
  }
};

export const updateAgentWorkload = async (agentId: string, increment: number = 1): Promise<void> => {
  try {
    // In a real implementation, this would update Neo4j
    console.log(`📈 Updating agent ${agentId} workload by ${increment}`);
    
    // Update mock data
    const agent = mockAgents.find(a => a.uid === agentId);
    if (agent) {
      agent.currentLoad = Math.max(0, agent.currentLoad + increment);
      console.log(`✅ Agent ${agent.displayName} workload updated to ${agent.currentLoad}/${agent.maxLoad}`);
    }
  } catch (error) {
    console.error('❌ Error updating agent workload:', error);
  }
};

export const getAgentSkills = async (agentId: string): Promise<string[]> => {
  try {
    // Simulate Neo4j query
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const agent = mockAgents.find(a => a.uid === agentId);
    return agent?.skills || [];
  } catch (error) {
    console.error('❌ Error fetching agent skills:', error);
    return [];
  }
};

export const getAgentWorkload = async (agentId: string): Promise<{ current: number; max: number }> => {
  try {
    // Simulate Neo4j query
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const agent = mockAgents.find(a => a.uid === agentId);
    return {
      current: agent?.currentLoad || 0,
      max: agent?.maxLoad || 5
    };
  } catch (error) {
    console.error('❌ Error fetching agent workload:', error);
    return { current: 0, max: 5 };
  }
};

// Sync all agents from Firestore into mockAgents
export const syncAgentsFromFirestore = async () => {
  const agentsSnap = await getDocs(collection(db, 'agents'));
  mockAgents.length = 0; // Clear current mockAgents
  agentsSnap.forEach(docSnap => {
    const data = docSnap.data();
    mockAgents.push({
      uid: data.uid,
      displayName: data.displayName,
      email: data.email,
      skills: data.skills || [],
      currentLoad: data.currentLoad || 0,
      maxLoad: data.maxLoad || 5,
      isAvailable: data.isAvailable !== false,
      seniorLevel: data.seniorLevel || false
    });
  });
  console.log('✅ [DEBUG] Synced agents from Firestore:', mockAgents);
};

// Cypher queries for reference (when implementing real Neo4j)
export const cypherQueries = {
  findBestAgent: `
    MATCH (a:Agent)-[:HAS_SKILL]->(s:Skill)
    WHERE s.name IN $requiredSkills
      AND a.isAvailable = true
      AND a.currentLoad < a.maxLoad
    WITH a, count(s) as skillMatches
    ORDER BY a.seniorLevel DESC, skillMatches DESC, a.currentLoad ASC
    LIMIT 1
    RETURN a
  `,
  
  updateWorkload: `
    MATCH (a:Agent {id: $agentId})
    SET a.currentLoad = a.currentLoad + $increment
    RETURN a
  `,
  
  getAgentSkills: `
    MATCH (a:Agent {id: $agentId})-[:HAS_SKILL]->(s:Skill)
    RETURN collect(s.name) as skills
  `,
  
  createTicketAssignment: `
    MATCH (a:Agent {id: $agentId}), (t:Ticket {id: $ticketId})
    CREATE (a)-[:ASSIGNED_TO {assignedAt: datetime()}]->(t)
    RETURN a, t
  `
};