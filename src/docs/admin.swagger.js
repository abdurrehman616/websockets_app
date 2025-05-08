const swaggerJSDoc = require('swagger-jsdoc');

const adminSwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin API',
      version: '1.0.0',
      description: 'Admin route documentation',
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Use JWT as the token format
        }
      }
    }
  },
  apis: ['./src/routes/admin.routes.js'], // Path to your admin routes
};

const adminSwaggerSpec = swaggerJSDoc(adminSwaggerOptions);
module.exports = adminSwaggerSpec;
