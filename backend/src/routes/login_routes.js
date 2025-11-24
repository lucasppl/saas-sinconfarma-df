import express from 'express';
import * as auth_controller from '../controllers/auth_controller.js';

const router = express.Router();

// Rota original: /api/login
router.post('/login', auth_controller.login);

export default router;
