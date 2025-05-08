const express = require('express');
const {
  adminRegister
} = require('../controllers/auth.controller');
const { adminRateLimiter } = require('../middleware/rateLimit');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/admin/register:
 *   post:
 *     summary: Register a new admin with name, email, password, and role
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []  # This indicates that the route requires Bearer authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email 
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               firstName:
 *                 type: string
 *                 example: John
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               country:
 *                 type: string
 *                 example: XYZ
 *               password:
 *                 type: string
 *                 example: StrongPass123
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
router.post('/auth/admin/register', adminRateLimiter, protect, adminRegister);

module.exports = router;
