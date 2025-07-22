import neo4j, { Driver, Session } from 'neo4j-driver';

const NEO4J_URI = 'bolt://localhost:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'neo4j'; // Change as needed

let driver: Driver | null = null;

function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
    );
  }
  return driver;
}

export async function getBestAgentForTicket(tags: string[]): Promise<string | null> {
  if (!tags.length) return null;
  const session: Session = getDriver().session();
  try {
    const result = await session.run(
      `
      MATCH (a:Agent)-[:HAS_SKILL]->(s:Skill)
      WHERE s.name IN $tags
      WITH a, count(s) AS skillMatches
      ORDER BY skillMatches DESC
      LIMIT 1
      RETURN a.email AS agentEmail
      `,
      { tags }
    );
    const record = result.records[0];
    return record ? record.get('agentEmail') : null;
  } catch (error) {
    console.error('Neo4j error:', error);
    return null;
  } finally {
    await session.close();
  }
}

export async function closeNeo4jConnection() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
