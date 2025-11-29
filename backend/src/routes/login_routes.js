import express from "express";
// IMPORTANTE: Verifique se o nome do arquivo aqui bate com o que você criou no passo 1
import * as auth_controller from "../controllers/auth_controller.js";

const router = express.Router();

// A rota será '/login' (porque no server já tem o prefixo /api)
router.post("/login", auth_controller.login);

export default router;
