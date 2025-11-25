const { app } = require('@azure/functions');
const { getContainer } = require('../shared/cosmosClient');

app.http('GetNoiseHistory', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('GetNoiseHistory function triggered');

    try {
      const url = new URL(request.url);
      const deviceId = url.searchParams.get('deviceId');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      const container = getContainer();

      let query = 'SELECT * FROM c ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit';
      const parameters = [{ name: '@limit', value: limit }];

      if (deviceId) {
        query = 'SELECT * FROM c WHERE c.deviceId = @deviceId ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit';
        parameters.push({ name: '@deviceId', value: deviceId });
      }

      const { resources: items } = await container.items
        .query({
          query,
          parameters
        })
        .fetchAll();

      context.log(`Retrieved ${items.length} noise records`);

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        jsonBody: {
          success: true,
          count: items.length,
          data: items.reverse()
        }
      };

    } catch (error) {
      context.error('Error retrieving noise history:', error);
      
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

