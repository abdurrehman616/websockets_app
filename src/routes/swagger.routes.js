const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../docs/user.swagger');

const router = express.Router();

// Admin Swagger UI
router.use('/admin', swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    tagsSorter: 'alpha',
  },
}));

// User Swagger UI
router.use('/user', swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec));

module.exports = router;


