const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT || '';
const key = process.env.COSMOS_DB_KEY || '';
const databaseId = 'BabyMonitorDB';
const containerId = 'NoiseData';

const sampleData = [
  { deviceId: 'baby_01', decibels: 42, hours: 48 },
  { deviceId: 'baby_01', decibels: 55, hours: 36 },
  { deviceId: 'baby_01', decibels: 48, hours: 24 },
  { deviceId: 'baby_01', decibels: 62, hours: 12 },
  { deviceId: 'baby_01', decibels: 70, hours: 6 },
  { deviceId: 'baby_01', decibels: 85, hours: 3 },
  { deviceId: 'baby_01', decibels: 78, hours: 2 },
  { deviceId: 'baby_01', decibels: 65, hours: 1 },
  { deviceId: 'baby_01', decibels: 52, hours: 0.5 },
  { deviceId: 'baby_01', decibels: 58, hours: 0.1 }
];

async function seedDatabase() {
  if (!endpoint || !key) {
    console.error('Error: Configura COSMOS_DB_ENDPOINT y COSMOS_DB_KEY');
    process.exit(1);
  }

  console.log('Conectando a Cosmos DB...');
  const client = new CosmosClient({ endpoint, key });
  const container = client.database(databaseId).container(containerId);

  console.log('Esperando que la base de datos esté lista...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Insertando datos de prueba...');
  let inserted = 0;

  for (const data of sampleData) {
    const timestamp = new Date(Date.now() - data.hours * 3600000).toISOString();
    const record = {
      id: `${data.deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId: data.deviceId,
      decibels: data.decibels,
      timestamp: timestamp,
      createdAt: new Date().toISOString()
    };

    try {
      await container.items.create(record);
      console.log(`✓ Insertado: ${data.decibels} dB (${data.hours}h atrás)`);
      inserted++;
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
    }
  }

  console.log(`\nCompletado: ${inserted}/${sampleData.length} registros insertados`);
}

seedDatabase().catch(console.error);

