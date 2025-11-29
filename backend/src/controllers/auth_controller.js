import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const sql = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.senha_hash,
        u.ativo,
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
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }
    const user = result.rows[0];

    if (!user.ativo) {
      return res.status(403).json({ error: "Este usuário está inativo." });
    }

    // Compara a senha do formulário com o HASH do banco
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    // Se a senha estiver errada
    if (!senhaValida) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    return res.status(200).json({
      message: "Login bem-sucedido!",
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role_nome,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
