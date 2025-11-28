import express from "express";
import { upload, uploadFoto } from "../controllers/upload_controller.js";

const router = express.Router();

// Rota POST
// 'foto' é o nome do campo que definimos no formData do frontend (addPhoto.js)
router.post("/", upload.single("foto"), uploadFoto);

export default router;
