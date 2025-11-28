import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer (Onde salvar e qual nome dar)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Salva na pasta 'uploads' que fica na raiz do backend
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    // Gera um nome único: data-atual + numero-aleatorio + extensao original
    const unico = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "fachada-" + unico + path.extname(file.originalname));
  },
});

// Inicializa o upload
export const upload = multer({ storage: storage });

// A função que responde ao Frontend depois que a foto salvou
export const uploadFoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  }

  // Cria o link público para acessar a foto
  // Ex: /uploads/fachada-16273812.jpg
  const caminhoFoto = `/uploads/${req.file.filename}`;

  console.log("Foto salva com sucesso em:", caminhoFoto);

  return res.status(200).json({
    message: "Foto enviada com sucesso!",
    url: caminhoFoto,
  });
};
