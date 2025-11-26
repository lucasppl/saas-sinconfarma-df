import express from 'express';
import * as farmacia_controller from '../controllers/farmacia_controller.js';

const router = express.Router();

// Rota original: /api/farmacias
router.get('/', farmacia_controller.getFarmacias);

export default router;
