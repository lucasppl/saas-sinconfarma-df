import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Importação das Rotas
import login_routes from './routes/login_routes.js';
import user_route from './routes/user_route.js';
import farmacia_route from './routes/farmacia_route.js';
import system_route from './routes/system_route.js';

// Configuração do __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use a variável de ambiente para a porta, com 8000 como padrão
const PORT = process.env.BACKEND_PORT || 8000;

// Middleware para entender JSON
app.use(express.json());

app.use(cors());

// DEFINIÇÃO DE ROTAS

app.use('/api', system_route);

app.use('/api', login_routes);

app.use('/api/usuarios', user_route);

app.use('/api/farmacias', farmacia_route);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
  console.log('Variáveis de ambiente carregadas:');
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
});
