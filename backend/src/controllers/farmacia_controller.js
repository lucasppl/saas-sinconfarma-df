import pool from '../config/db.js';

export const getFarmacias = async (req, res) => {
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
};
