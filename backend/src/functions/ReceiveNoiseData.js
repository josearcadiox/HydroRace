const { app } = require('@azure/functions');
const { getContainer } = require('../shared/cosmosClient');

app.http('ReceiveNoiseData', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('ReceiveNoiseData function triggered');

    try {
      const body = await request.json();
      
      const { deviceId, decibels, timestamp } = body;

      if (!deviceId || decibels === undefined || !timestamp) {
        return {
          status: 400,
          jsonBody: {
            error: 'Missing required fields: deviceId, decibels, timestamp'
          }
        };
      }

      const noiseRecord = {
        id: `${deviceId}_${Date.now()}`,
        deviceId,
        decibels: parseFloat(decibels),
        timestamp: timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const container = getContainer();
      const { resource: createdItem } = await container.items.create(noiseRecord);

      context.log(`Noise data saved: ${JSON.stringify(createdItem)}`);

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: createdItem
        }
      };

    } catch (error) {
      context.error('Error processing noise data:', error);
      
      return {
        status: 500,
        jsonBody: {
          error: 'Internal server error',
          message: error.message
        }
      };
    }
  }
});

