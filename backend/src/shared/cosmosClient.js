const { CosmosClient } = require('@azure/cosmos');

let cosmosClient;
let container;

function getCosmosClient() {
  if (!cosmosClient) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT || 'CONFIGURE_ENDPOINT';
    const key = process.env.COSMOS_DB_KEY || 'CONFIGURE_KEY';
    cosmosClient = new CosmosClient({ endpoint, key });
  }
  return cosmosClient;
}

function getContainer() {
  if (!container) {
    const client = getCosmosClient();
    const database = client.database(process.env.COSMOS_DB_DATABASE || 'BabyMonitorDB');
    container = database.container(process.env.COSMOS_DB_CONTAINER || 'NoiseData');
  }
  return container;
}

module.exports = { getCosmosClient, getContainer };

