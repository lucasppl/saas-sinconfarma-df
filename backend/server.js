import express from 'express';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import cors from 'cors';

// Configuração do __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Configuração da Conexão com o Banco
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false
});

// Middleware para entender
app.use(express.json());

app.use(cors());

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const sql = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.senha_hash,
        r.nome AS role_nome
      FROM
        usuarios u
      INNER JOIN
        roles r ON u.role_id = r.id
      WHERE
        u.email = $1;
    `;
    const result = await pool.query(sql, [email]);

    // Se o usuário não for encontrado
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    const user = result.rows[0];

    // Compara a senha do formulário com o HASH do banco
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    // Se a senha estiver errada
    if (!senhaValida) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    return res.status(200).json({
      message: 'Login bem-sucedido!',
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role_nome
      }
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Rota de teste da API
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Conexão com o banco de dados bem-sucedida!',
      hora_do_banco: result.rows[0].now
    });
  } catch (err) {
    console.error('Erro ao conectar no banco:', err);
    res.status(500).json({ error: 'Erro ao conectar no banco', details: err.message });
  }
});

// Rota da API para buscar usuários com roles
app.get('/api/usuarios', async (req, res) => {
  try {
    const sql = `
      SELECT
        usuarios.id,
        usuarios.nome,
        usuarios.email,
        roles.nome AS role_nome
      FROM
        usuarios
      INNER JOIN
        roles ON usuarios.role_id = roles.id
      ORDER BY
        usuarios.nome;
    `;
    const { rows } = await pool.query(sql);
    res.json(rows);

  } catch (err) {
    console.error('Erro ao buscar usuários (com join):', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  // Pega os dados do corpo (body) da requisição (o que o frontend enviou)
  console.log('--- ROTA POST /api/usuarios INICIADA ---'); // <-- LOG 1
  const { nome, email, senha, role_id } = req.body;
  console.log('Dados recebidos:', req.body); // <-- LOG 2

  // Validação
  if (!nome || !email || !senha || !role_id) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  // *** NOVA VALIDAÇÃO ADICIONADA ***
  // Garante que a senha é uma string antes de tentar o hash
  if (typeof senha !== 'string' || senha.length === 0) {
    return res.status(400).json({ error: 'O campo "senha" deve ser uma string válida.' });
  }
  // *** FIM DA NOVA VALIDAÇÃO ***

  try {
    console.log('Entrou no TRY. Vai tentar o hash...'); // <-- LOG 3
    const hashDaSenha = await bcrypt.hash(senha, 10);
    console.log('Hash criado com sucesso.'); // <-- LOG 4

    // Inserir no banco de dados
    // salvamos o HASH, não a senha pura
    const sql = `
      INSERT INTO usuarios (nome, email, senha_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nome, email, role_id, criado_em
    `; // RETURNING nos devolve o usuário recém-criado

    console.log('Vai tentar inserir no banco...'); // <-- LOG 5
    const { rows } = await pool.query(sql, [nome, email, hashDaSenha, role_id]);
    console.log('Inserido no banco com sucesso.'); // <-- LOG 6


    // Devolver o novo usuário para o frontend
    const novoUsuario = rows[0];
    return res.status(201).json(novoUsuario);

  } catch (err) {
    // email já existe
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    // *** ESTE É O LOG MAIS IMPORTANTE ***
    console.error('--- ERRO CAPTURADO NO CATCH ---');
    console.error('Mensagem:', err.message);
    console.error('Código do Erro:', err.code);
    console.error('Stack Trace:', err.stack);
    console.error('Objeto de Erro Completo:', err);
    res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
});

app.get('/api/farmacias', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM farmacias ORDER BY nome');
    res.json(rows); // Devolve a lista de farmácias como JSON
  } catch (err) {
    console.error('Erro ao buscar farmácias:', err);
    res.status(500).json({ error: 'Erro ao buscar farmácias' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
  console.log('Variáveis de ambiente carregadas:');
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
});
