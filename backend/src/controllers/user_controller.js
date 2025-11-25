import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// --- LISTAR USUÁRIOS (GET) ---
export const getUsuarios = async (req, res) => {
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
    console.error("Erro ao buscar usuários (com join):", err);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT u.id, u.nome, u.email, u.telefone, u.ativo, r.nome AS role_nome
      FROM usuarios u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const { rows } = await pool.query(sql, [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar usuário ID:", err);
    res.status(500).json({ error: "Erro interno" });
  }
};

// --- CRIAR USUÁRIO (POST) ---
export const createUsuario = async (req, res) => {
  const { nome, email, senha, role_id, telefone } = req.body;

  if (!nome || !email || !senha || !role_id) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }
  if (typeof senha !== "string" || senha.length === 0) {
    return res
      .status(400)
      .json({ error: 'O campo "senha" deve ser uma string válida.' });
  }

  try {
    const hashDaSenha = await bcrypt.hash(senha, 10);

    const telefoneParaDB = telefone === "" ? null : telefone;

    const sql = `
      INSERT INTO usuarios (nome, email, senha_hash, role_id, telefone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, role_id, criado_em, ativo, telefone
    `;

    const { rows } = await pool.query(sql, [
      nome,
      email,
      hashDaSenha,
      role_id,
      telefoneParaDB,
    ]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Este e-mail já está em uso." });
    console.error("Erro ao criar usuário:", err);
    res.status(500).json({ error: "Erro interno ao criar usuário." });
  }
};

// --- ATUALIZAR USUÁRIO (PUT) ---
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, email, role_id, ativo, telefone } = req.body;

  if (!id)
    return res.status(400).json({ error: "ID do usuário é obrigatório." });

  // --- LÓGICA ORIGINAL DE MONTAGEM DINÂMICA ---
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
    updateValues.push(telefone === "" ? null : telefone);
  }

  if (updateFields.length === 0) {
    return res
      .status(400)
      .json({ error: "Nenhum campo para atualização foi fornecido." });
  }

  updateValues.push(id);

  const sql = `
    UPDATE usuarios
    SET ${updateFields.join(", ")}, atualizado_em = current_timestamp
    WHERE id = $${paramCount}
    RETURNING id, nome, email, role_id, ativo, telefone;
  `;

  try {
    const { rows } = await pool.query(sql, updateValues);
    if (rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado." });
    return res.status(200).json(rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "Este e-mail já está em uso por outro usuário." });
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Erro interno ao atualizar usuário." });
  }
};

// --- DELETAR USUÁRIO (DELETE) ---
export const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = "DELETE FROM usuarios WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(sql, [id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado." });

    return res.status(200).json({
      message: `Usuário "${rows[0].nome}" (ID: ${id}) excluído com sucesso.`,
    });
  } catch (err) {
    if (err.code === "23503")
      return res.status(409).json({
        error:
          "Este usuário não pode ser excluído pois está ligado a outros registros.",
      });
    console.error("Erro ao excluir usuário:", err);
    res.status(500).json({ error: "Erro interno ao excluir usuário." });
  }
};
