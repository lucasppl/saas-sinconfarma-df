import express from 'express';
import * as system_controller from '../controllers/system_controller.js';

const router = express.Router();

// Rota original: /api/db-test
router.get('/db-test', system_controller.dbTest);

export default router;
