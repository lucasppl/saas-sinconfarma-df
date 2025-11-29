import express from "express";
import * as farmacia_controller from "../controllers/farmacia_controller.js"; // Ajuste o nome se necessário

const router = express.Router();

router.get("/", farmacia_controller.getFarmacias); // (Se já tiver essa)

router.post("/check-cnpj", farmacia_controller.buscarOuCadastrar);

export default router;
