import express from "express";
import * as avaliacaoController from "../controllers/avaliacao_controller.js";

const router = express.Router();

// Rota existente (Salvar questionário)
router.post("/", avaliacaoController.criarAvaliacao);

// --- NOVAS ROTAS ---
router.get("/:id/pdf", avaliacaoController.baixarPDF); // Para baixar
router.post("/:id/email", avaliacaoController.enviarEmail); // Para enviar

export default router;
