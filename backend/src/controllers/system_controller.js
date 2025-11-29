import pool from "../config/db.js";

export const dbTest = async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Conexão com o banco de dados bem-sucedida!",
      hora_do_banco: result.rows[0].now,
    });
  } catch (err) {
    console.error("Erro ao conectar no banco:", err);
    res
      .status(500)
      .json({ error: "Erro ao conectar no banco", details: err.message });
  }
};
