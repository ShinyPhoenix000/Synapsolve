import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  import.meta.env.VITE_NEO4J_URI,
  neo4j.auth.basic(
    import.meta.env.VITE_NEO4J_USERNAME,
    import.meta.env.VITE_NEO4J_PASSWORD
  )
);

export const runQuery = async (cypher: string, params: Record<string, any> = {}) => {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map(record => record.toObject());
  } catch (error) {
    console.error('Neo4j query failed:', error);
    throw error;
  } finally {
    await session.close();
  }
};
