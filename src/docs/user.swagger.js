const swaggerJSDoc = require('swagger-jsdoc');

const userSwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API Docs',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/user.routes.js'], // user routes
};

const userSwaggerSpec = swaggerJSDoc(userSwaggerOptions);
module.exports = userSwaggerSpec;
