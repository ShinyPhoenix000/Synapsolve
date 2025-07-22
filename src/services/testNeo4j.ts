import { getBestAgentForTicket, closeNeo4jConnection } from "./neo4jIntegration";

async function testNeo4j() {
  // Example tags to test
  const tags = ["JavaScript", "Support", "GraphQL"];
  const agentEmail = await getBestAgentForTicket(tags);
  if (agentEmail) {
    console.log("Best agent email:", agentEmail);
  } else {
    console.log("No agent found for tags:", tags);
  }
  await closeNeo4jConnection();
}

testNeo4j();
