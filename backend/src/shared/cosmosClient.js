const { CosmosClient } = require('@azure/cosmos');

let container;

function getContainer() {
  if (!container) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(process.env.COSMOS_DB_DATABASE);
    container = database.container(process.env.COSMOS_DB_CONTAINER);
  }
  return container;
}

module.exports = { getContainer };
