require('dotenv').config();
const http = require('http');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const { createDefaultAdmin } = require('./src/seed/admin.seeder');
const { setupSockets } = require('./src/sockets/sockets');
const logger = require('./src/utils/logger');
const userSwaggerSpec = require('./src/docs/user.swagger');
const adminSwaggerSpec = require('./src/docs/admin.swagger');

// Import route files
const userRoutes = require('./src/routes/user.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/', (req, res) => res.send('API is running'));

// Swagger Docs Routes
app.use('/api/docs/user', swaggerUi.serveFiles(userSwaggerSpec), swaggerUi.setup(userSwaggerSpec));
app.use('/api/docs/admin', swaggerUi.serveFiles(adminSwaggerSpec), swaggerUi.setup(adminSwaggerSpec));

// Use route files
app.use(userRoutes);  // User routes
app.use(adminRoutes);  // Admin routes

// Start server only after DB is connected and default admin is created
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected');

        await createDefaultAdmin();
        console.log('✅ Default admin setup complete');

        const PORT = process.env.PORT || 8000;
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

        // Setup WebSockets
        setupSockets(io);

    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
