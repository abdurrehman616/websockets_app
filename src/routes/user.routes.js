const express = require('express');
const {
  signup,
  verifyEmail,
  login
} = require('../controllers/auth.controller');
const { userRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

/**
 * @swagger
 * /auth/user/signup:
 *   post:
 *     summary: User sign up with name, first name, email, country, and password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sign-up successful, email verification sent
 *       400:
 *         description: Invalid input or already registered email
 *       409:
 *         description: Email already in use
 */
router.post('/auth/user/signup', userRateLimiter, signup);

/**
 * @swagger
 * /auth/user/verify:
 *   post:
 *     summary: Verify user email with the code sent
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification code
 *       404:
 *         description: User not found
 */
router.post('/auth/user/verify', userRateLimiter, verifyEmail);

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     summary: User login with email and password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post('/auth/user/login', userRateLimiter, login);

module.exports = router;
