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
// Use a variável de ambiente para a porta, com 8000 como padrão
const PORT = process.env.BACKEND_PORT || 8000;

// Configuração da Conexão com o Banco
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false
});

// Middleware para entender JSON
app.use(express.json());

app.use(cors());

// --- ROTAS DE AUTENTICAÇÃO ---

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
        u.ativo, -- Adicionado para o frontend saber o status
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

    if (!user.ativo) {
      return res.status(403).json({ error: 'Este usuário está inativo.' });
    }

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

// --- ROTAS DE USUÁRIOS (CRUD) ---

app.get('/api/usuarios', async (req, res) => {
  try {
    const sql = `
      SELECT
        usuarios.id,
        usuarios.nome,
        usuarios.email,
        usuarios.telefone,
        usuarios.ativo,
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
  const { nome, email, senha, role_id } = req.body;

  // Validação
  if (!nome || !email || !senha || !role_id) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  if (typeof senha !== 'string' || senha.length === 0) {
    return res.status(400).json({ error: 'O campo "senha" deve ser uma string válida.' });
  }

  try {
    const hashDaSenha = await bcrypt.hash(senha, 10);

    // Converte string vazia de telefone para NULL antes de inserir
    const telefoneParaDB = telefone === '' ? null : telefone;

    // Inserir no banco de dados
    // A coluna 'ativo' não é necessária aqui, pois a migration
    // define 'default: true'
    const sql = `
      INSERT INTO usuarios (nome, email, senha_hash, role_id, telefone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, role_id, criado_em, ativo, telefone
    `;

    const { rows } = await pool.query(sql, [nome, email, hashDaSenha, role_id, telefoneParaDB]);

    // Devolver o novo usuário para o frontend
    const novoUsuario = rows[0];
    return res.status(201).json(novoUsuario);

  } catch (err) {
    // email já existe
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
});

// --- ROTA PUT (EDITAR USUÁRIO) ---
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  // O frontend pode enviar nome, email, role_id, e ativo.
  const { nome, email, role_id, ativo, telefone } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
  }

  // Monta a query dinamicamente apenas com os campos que vieram no body
  let updateFields = [];
  let updateValues = [];
  let paramCount = 1;

  if (nome !== undefined) {
    updateFields.push(`nome = $${paramCount++}`);
    updateValues.push(nome);
  }
  if (email !== undefined) {
    updateFields.push(`email = $${paramCount++}`);
    updateValues.push(email);
  }
  if (role_id !== undefined) {
    updateFields.push(`role_id = $${paramCount++}`);
    updateValues.push(role_id);
  }
  if (ativo !== undefined) {
    updateFields.push(`ativo = $${paramCount++}`);
    updateValues.push(ativo);
  }
  if (telefone !== undefined) {
    updateFields.push(`telefone = $${paramCount++}`);
    // Se o frontend mandar "", salvamos NULL no banco
    updateValues.push(telefone === '' ? null : telefone);
  }

  // Se nada foi enviado, retorna erro
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualização foi fornecido.' });
  }

  // Adiciona o ID do usuário como último parâmetro
  updateValues.push(id);

  const sql = `
    UPDATE usuarios
    SET ${updateFields.join(', ')}, atualizado_em = current_timestamp
    WHERE id = $${paramCount}
    RETURNING id, nome, email, role_id, ativo, telefone;
  `;

  try {
    const { rows } = await pool.query(sql, updateValues);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json(rows[0]);

  } catch (err) {
    // E-mail duplicado
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
    }
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar usuário.' });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params; // Pega o ID da URL (ex: /api/usuarios/5)

  try {
    const sql = 'DELETE FROM usuarios WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(sql, [id]);

    if (rows.length === 0) {
      // Se não encontrou ninguém com esse ID
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json({
      message: `Usuário "${rows[0].nome}" (ID: ${id}) excluído com sucesso.`
    });

  } catch (err) {
    if (err.code === '23503') {
       return res.status(409).json({ error: 'Este usuário não pode ser excluído pois está ligado a outros registros.' });
    }
    console.error('Erro ao excluir usuário:', err);
    res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
  }
});


app.get('/api/farmacias', async (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        nome,
        endereco,
        telefone,
        cnpj,
        url_logo,
        horario_funcionamento,
        nota_media,
        latitude,
        longitude
      FROM farmacias
      ORDER BY nome
    `;
    const { rows } = await pool.query(sql);
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
