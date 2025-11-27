const { app } = require('@azure/functions');
const { getContainer } = require('../shared/cosmosClient');

app.http('GetNoiseHistory', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const container = getContainer();

      const query = 'SELECT * FROM c ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit';
      const { resources: items } = await container.items
        .query({ query, parameters: [{ name: '@limit', value: limit }] })
        .fetchAll();

      return {
        status: 200,
        jsonBody: {
          success: true,
          count: items.length,
          data: items.reverse()
        }
      };

    } catch (error) {
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
  }
});
