import express from 'express';
import * as user_controller from '../controllers/user_controller.js';

const router = express.Router();

// Rotas originais: /api/usuarios e /api/usuarios/:id
router.get('/', user_controller.getUsuarios);
router.post('/', user_controller.createUsuario);
router.put('/:id', user_controller.updateUsuario);
router.delete('/:id', user_controller.deleteUsuario);

export default router;
