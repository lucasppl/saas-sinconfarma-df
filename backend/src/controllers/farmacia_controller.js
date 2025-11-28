import pool from "../config/db.js";

// --- LISTAR TODAS AS FARMÁCIAS (Para a rota GET /) ---
export const getFarmacias = async (req, res) => {
  try {
    const sql = `
      SELECT id, nome, endereco, telefone, cnpj, url_logo, horario_funcionamento, nota_media, latitude, longitude
      FROM farmacias
      ORDER BY nome
    `;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar farmácias:", err);
    res.status(500).json({ error: "Erro ao buscar farmácias" });
  }
};

// --- [NOVO] BUSCAR OU CADASTRAR PELO CNPJ (Para a rota POST /check-cnpj) ---
export const buscarOuCadastrar = async (req, res) => {
  const { cnpj, nome, endereco, telefone } = req.body;

  console.log("Verificando CNPJ:", cnpj); // Debug

  if (!cnpj) {
    return res.status(400).json({ error: "CNPJ é obrigatório" });
  }

  try {
    // 1. Verifica se já existe no banco
    const busca = await pool.query(
      "SELECT id, nome FROM farmacias WHERE cnpj = $1",
      [cnpj]
    );

    if (busca.rows.length > 0) {
      console.log("Farmácia já existe. ID:", busca.rows[0].id);
      return res.json({
        message: "Farmácia encontrada no sistema.",
        id: busca.rows[0].id,
        nome: busca.rows[0].nome,
      });
    }

    // 2. NÃO EXISTE: Cria uma nova
    console.log("Cadastrando nova farmácia...");
    const insert = `
            INSERT INTO farmacias (nome, cnpj, endereco, telefone)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nome
        `;

    const novaFarmacia = await pool.query(insert, [
      nome || "Farmácia Sem Nome",
      cnpj,
      endereco || "Endereço não informado",
      telefone || "Sem telefone",
    ]);

    return res.status(201).json({
      message: "Farmácia cadastrada automaticamente.",
      id: novaFarmacia.rows[0].id,
      nome: novaFarmacia.rows[0].nome,
    });
  } catch (err) {
    console.error("Erro ao buscar/criar farmácia:", err);
    res.status(500).json({ error: "Erro interno ao processar farmácia." });
  }
};
