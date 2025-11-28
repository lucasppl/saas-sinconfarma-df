import pool from "../config/db.js";
import { gerarRelatorioPDF } from "../services/pdf_service.js";
import { enviarEmailComAnexo } from "../services/email_service.js";

export const criarAvaliacao = async (req, res) => {
  // 1. CORREÇÃO: Extrair os dados ANTES de tentar usar ou logar
  const { usuario_id, farmacia_id, respostas, foto, observacoes } = req.body;

  // --- DEBUG NO TERMINAL (Agora funciona porque as variáveis existem) ---
  console.log("--- TENTATIVA DE AVALIAÇÃO ---");
  console.log("Usuario ID:", usuario_id);
  console.log("Farmacia ID:", farmacia_id);
  console.log("Qtd Respostas:", respostas ? respostas.length : "Sem array");
  console.log("Foto URL:", foto);
  console.log("Observações:", observacoes);
  // -------------------------

  // 2. Validação Detalhada
  if (!usuario_id) {
    return res
      .status(400)
      .json({ error: "Erro: ID do Usuário não foi identificado." });
  }
  if (!farmacia_id) {
    return res
      .status(400)
      .json({ error: "Erro: ID da Farmácia não foi identificado." });
  }
  if (!respostas || respostas.length === 0) {
    return res
      .status(400)
      .json({ error: "Erro: Nenhuma resposta do questionário foi recebida." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // --- 3. INSERIR AVALIAÇÃO (CAPA) ---
    // Inclui foto_url e observacoes_gerais
    const sqlAvaliacao = `
            INSERT INTO avaliacoes (
                farmacia_id, 
                avaliador_id, 
                foto_url, 
                observacoes_gerais, 
                data_avaliacao, 
                pontuacao_final
            )
            VALUES ($1, $2, $3, $4, NOW(), 0)
            RETURNING id
        `;

    const resultAvaliacao = await client.query(sqlAvaliacao, [
      farmacia_id,
      usuario_id,
      foto, // $3 (Pode ser null se o front não mandar)
      observacoes || null, // $4 (Salva NULL se estiver vazio)
    ]);

    const avaliacaoId = resultAvaliacao.rows[0].id;

    // --- MAPA DE PONTUAÇÃO ---
    const mapaPontos = {
      BOM: 3,
      MEDIO: 1,
      RUIM: 0,
    };

    let somaPontosTotal = 0;

    // --- 4. SALVAR CADA RESPOSTA ---
    for (const resp of respostas) {
      // Converte texto em número (BOM -> 3)
      const pontos =
        mapaPontos[resp.avaliacao] !== undefined
          ? mapaPontos[resp.avaliacao]
          : 0;

      // Busca o ID da pergunta no banco
      const sqlBuscaItem = `
                SELECT id FROM itens_avaliacao 
                WHERE categoria_id = $1 AND texto_pergunta = $2
                LIMIT 1
            `;
      const resItem = await client.query(sqlBuscaItem, [
        resp.categoria_id,
        resp.pergunta,
      ]);

      if (resItem.rows.length === 0) {
        console.warn(`Item não encontrado no banco: ${resp.pergunta}`);
        continue; // Pula este item para não quebrar tudo
      }

      const itemId = resItem.rows[0].id;

      // Insere a resposta
      const sqlInsertResp = `
                INSERT INTO respostas_avaliacao (avaliacao_id, item_id, resposta_valor, pontos)
                VALUES ($1, $2, $3, $4)
            `;

      await client.query(sqlInsertResp, [
        avaliacaoId,
        itemId,
        resp.avaliacao, // Salva texto "BOM"
        pontos, // Salva nota 3
      ]);

      somaPontosTotal += pontos;
    }

    // --- 5. ATUALIZAR A PONTUAÇÃO FINAL ---
    const sqlUpdateScore = `
            UPDATE avaliacoes 
            SET pontuacao_final = $1 
            WHERE id = $2
        `;
    await client.query(sqlUpdateScore, [somaPontosTotal, avaliacaoId]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Avaliação salva com sucesso!",
      id: avaliacaoId,
      pontuacao_total: somaPontosTotal,
      foto_salva: foto,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao salvar avaliação:", err);
    res
      .status(500)
      .json({ error: "Erro ao processar avaliação no banco de dados." });
  } finally {
    client.release();
  }
};

// --- FUNÇÃO AUXILIAR (Busca tudo do banco) ---
const buscarDadosCompletos = async (id) => {
  const client = await pool.connect();

  // 1. Pega dados da capa (farmacia, avaliador, foto)
  const sqlCapa = `
        SELECT a.*, f.nome as nome_farmacia, u.nome as nome_avaliador
        FROM avaliacoes a
        JOIN farmacias f ON a.farmacia_id = f.id
        JOIN usuarios u ON a.avaliador_id = u.id
        WHERE a.id = $1
    `;
  const resCapa = await client.query(sqlCapa, [id]);

  // 2. Pega as respostas e perguntas
  const sqlItens = `
        SELECT ia.texto_pergunta as pergunta, ra.resposta_valor as avaliacao 
        FROM respostas_avaliacao ra 
        JOIN itens_avaliacao ia ON ra.item_id = ia.id 
        WHERE ra.avaliacao_id = $1
    `;
  const resItens = await client.query(sqlItens, [id]);

  client.release();

  if (resCapa.rows.length === 0) return null;

  // Retorna o objeto montado
  return {
    ...resCapa.rows[0],
    pontuacao_total: resCapa.rows[0].pontuacao_final,
    observacoes: resCapa.rows[0].observacoes_gerais,
    respostas: resItens.rows,
  };
};

// --- ROTA 1: BAIXAR PDF (GET) ---
export const baixarPDF = async (req, res) => {
  try {
    const dados = await buscarDadosCompletos(req.params.id);
    if (!dados) return res.status(404).send("Avaliação não encontrada");

    const pdfBuffer = await gerarRelatorioPDF(dados, dados.foto_url);

    // Configura o navegador para baixar o arquivo
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Relatorio_Visita_${dados.id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro ao gerar PDF");
  }
};

// --- ROTA 2: ENVIAR EMAIL (POST) ---
export const enviarEmail = async (req, res) => {
  try {
    const dados = await buscarDadosCompletos(req.params.id);
    if (!dados) return res.status(404).json({ error: "Não encontrado" });

    // Gera o PDF em memória
    const pdfBuffer = await gerarRelatorioPDF(dados, dados.foto_url);

    // Envia por e-mail (Mude o email de destino aqui para testar)
    await enviarEmailComAnexo("cliente_teste@exemplo.com", dados, pdfBuffer);

    res.json({ message: "E-mail enviado com sucesso!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao enviar e-mail" });
  }
};
