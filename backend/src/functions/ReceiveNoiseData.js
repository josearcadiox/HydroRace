const { app } = require('@azure/functions');
const { getContainer } = require('../shared/cosmosClient');

app.http('ReceiveNoiseData', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { deviceId, decibels, timestamp } = body;
      if (!deviceId || !decibels || !timestamp) {
        return {
          status: 400,
          jsonBody: { error: 'Faltan campos requeridos' }
        };
      }

      const record = {
        id: `${deviceId}_${Date.now()}`,
        deviceId,
        decibels: parseFloat(decibels),
        timestamp,
        createdAt: new Date().toISOString()
      };

      const container = getContainer();
      await container.items.create(record);

      return {
        status: 201,
        jsonBody: { success: true, data: record }
      };

    } catch (error) {
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
  }
});
