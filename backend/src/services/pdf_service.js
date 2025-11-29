import html_to_pdf from "html-pdf-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const gerarRelatorioPDF = async (dados, fotoUrl) => {
  // --- 1. LÓGICA DO GRÁFICO (QuickChart) ---
  // Calcula o total possível (assumindo que nota máxima é 3 por pergunta)
  const totalPerguntas = dados.respostas.length || 1;
  const maximoPontos = totalPerguntas * 3;
  const pontosObtidos = parseFloat(dados.pontuacao_total);
  const pontosPerdidos = maximoPontos - pontosObtidos;

  // Calcula porcentagem para mostrar
  const porcentagem = Math.round((pontosObtidos / maximoPontos) * 100);

  // URL que gera a imagem do gráfico (Doughnut Chart)
  // Usamos azul (#2962ff) para os pontos e cinza (#eee) para o restante
  const chartConfig = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [pontosObtidos, pontosPerdidos],
          backgroundColor: ["#2962ff", "#eeeeee"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "70%", // Deixa o buraco no meio maior
      plugins: { legend: { display: false }, datalabels: { display: false } },
    },
  };

  // Cria a URL da imagem do gráfico
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chartConfig)
  )}&w=300&h=300`;

  // --- 2. PROCESSA A FOTO DA FACHADA ---
  let imagemHtml = "";
  if (fotoUrl) {
    try {
      const caminhoFoto = path.join(__dirname, "../../", fotoUrl);
      if (fs.existsSync(caminhoFoto)) {
        const bitmap = fs.readFileSync(caminhoFoto);
        const base64 = Buffer.from(bitmap).toString("base64");
        const extensao = path.extname(caminhoFoto).substring(1);

        // Adicionei o Título e a Imagem
        imagemHtml = `
            <div class="foto-container">
                <h3>Registro Fotográfico da Fachada</h3>
                <img src="data:image/${extensao};base64,${base64}" class="foto-fachada">
            </div>
        `;
      }
    } catch (e) {
      console.error("Erro ao processar imagem para PDF:", e);
    }
  }

  // --- 3. MONTA O HTML DO RELATÓRIO ---
  const conteudoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                
                /* Cabeçalho */
                .header { border-bottom: 2px solid #2962ff; padding-bottom: 10px; margin-bottom: 30px; }
                h1 { color: #2962ff; margin: 0; font-size: 24px; }
                .sub-title { color: #666; font-size: 14px; margin-top: 5px; }

                /* Caixa de Informações e Gráfico */
                .dashboard { 
                    display: flex; 
                    background: #f8f9fa; 
                    border: 1px solid #eee; 
                    border-radius: 10px; 
                    padding: 20px; 
                    margin-bottom: 30px;
                    align-items: center;
                }
                .info-col { flex: 1; }
                .chart-col { width: 150px; text-align: center; position: relative; }
                
                .info-item { margin-bottom: 8px; font-size: 14px; }
                .nota-grande { font-size: 32px; font-weight: bold; color: #2962ff; margin-top: 10px; }
                .nota-label { font-size: 12px; color: #666; text-transform: uppercase; }

                /* Gráfico */
                .chart-img { width: 120px; height: 120px; }
                .chart-percent { 
                    position: absolute; top: 50%; left: 50%; 
                    transform: translate(-50%, -50%); 
                    font-size: 22px; font-weight: bold; color: #333; 
                }

                /* Foto */
                .foto-container { margin-bottom: 30px; text-align: center; page-break-inside: avoid; }
                .foto-container h3 { color: #444; font-size: 16px; margin-bottom: 10px; text-align: left; border-left: 4px solid #2962ff; padding-left: 10px; }
                .foto-fachada { width: 100%; max-height: 350px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }

                /* Tabela */
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
                th { background: #2962ff; color: white; padding: 10px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #eee; }
                tr:nth-child(even) { background-color: #fcfcfc; }
                
                /* Notas Coloridas na Tabela */
                .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; color: white; }
                .bg-bom { background-color: #00c853; }
                .bg-medio { background-color: #ffab00; }
                .bg-ruim { background-color: #d32f2f; }

                /* Observações */
                .obs-container { margin-top: 30px; page-break-inside: avoid; }
                .obs-box { border: 1px solid #ddd; padding: 15px; background: #fff; border-radius: 5px; min-height: 60px; font-style: italic; color: #555; }

                .footer { margin-top: 50px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Relatório de Visita Técnica</h1>
                <div class="sub-title">Sistema de Avaliação SincoFarma</div>
            </div>

            <div class="dashboard">
                <div class="info-col">
                    <div class="info-item"><strong>Farmácia:</strong> ${
                      dados.nome_farmacia || "ID " + dados.farmacia_id
                    }</div>
                    <div class="info-item"><strong>Avaliador:</strong> ${
                      dados.nome_avaliador || "ID " + dados.avaliador_id
                    }</div>
                    <div class="info-item"><strong>Data:</strong> ${new Date(
                      dados.data_avaliacao
                    ).toLocaleString("pt-BR")}</div>
                    
                    <div class="nota-grande">${
                      dados.pontuacao_total
                    } <span style="font-size:16px; color:#999">/ ${maximoPontos}</span></div>
                    <div class="nota-label">Pontuação Total</div>
                </div>
                
                <div class="chart-col">
                    <img src="${chartUrl}" class="chart-img" />
                    <div class="chart-percent">${porcentagem}%</div>
                </div>
            </div>
            
            ${imagemHtml}

            <h3>Detalhamento da Avaliação</h3>
            <table>
                <thead><tr><th width="70%">Item Avaliado</th><th width="30%">Situação</th></tr></thead>
                <tbody>
                    ${dados.respostas
                      .map((r) => {
                        // Define a cor da "Badge"
                        let classeCor = "bg-ruim";
                        if (r.avaliacao === "BOM") classeCor = "bg-bom";
                        if (r.avaliacao === "MEDIO") classeCor = "bg-medio";

                        return `
                        <tr>
                            <td>${r.pergunta}</td>
                            <td><span class="badge ${classeCor}">${r.avaliacao}</span></td>
                        </tr>
                    `;
                      })
                      .join("")}
                </tbody>
            </table>

            <div class="obs-container">
                <h3>Observações Finais</h3>
                <div class="obs-box">${
                  dados.observacoes || "Nenhuma observação registrada."
                }</div>
            </div>

            <div class="footer">
                Relatório gerado automaticamente em ${new Date().toLocaleString()}.
            </div>
        </body>
        </html>
    `;

  const file = { content: conteudoHTML };

  const options = {
    format: "A4",
    printBackground: true, // Importante para sair as cores de fundo
    margin: { top: 20, bottom: 20, left: 20, right: 20 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  return html_to_pdf.generatePdf(file, options);
};
