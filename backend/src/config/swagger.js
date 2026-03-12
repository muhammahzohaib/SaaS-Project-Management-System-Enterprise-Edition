/**
 * API Documentation - OpenAPI/Swagger placeholder
 * Install: npm i swagger-ui-express swagger-jsdoc
 * Then mount in app.js: app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
 */
const apiVersion = process.env.API_VERSION || 'v1';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: { title: 'SaaS PM API', version: '1.0.0', description: 'REST API for Project Management' },
  servers: [{ url: `http://localhost:${process.env.PORT || 5000}/api/${apiVersion}`, description: 'Development' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  security: [{ bearerAuth: [] }],
};

module.exports = swaggerDefinition;
