import html_to_pdf from "html-pdf-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const gerarRelatorioPDF = async (dados, fotoUrl) => {
  // 1. Processa a Foto (Converte para Base64)
  let imagemHtml = "";
  if (fotoUrl) {
    try {
      const caminhoFoto = path.join(__dirname, "../../", fotoUrl);
      if (fs.existsSync(caminhoFoto)) {
        const bitmap = fs.readFileSync(caminhoFoto);
        const base64 = Buffer.from(bitmap).toString("base64");
        const extensao = path.extname(caminhoFoto).substring(1);
        imagemHtml = `<img src="data:image/${extensao};base64,${base64}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">`;
      }
    } catch (e) {
      console.error("Erro ao processar imagem para PDF:", e);
    }
  }

  // 2. Monta o HTML do Relatório
  const conteudoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                h1 { color: #2962ff; border-bottom: 2px solid #2962ff; padding-bottom: 10px; margin-bottom: 20px; }
                .info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eee; }
                .nota-box { font-size: 24px; font-weight: bold; color: #2962ff; margin-top: 15px; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th { background: #2962ff; color: white; padding: 12px; text-align: left; }
                td { padding: 12px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                
                .obs { border: 1px solid #ccc; padding: 15px; margin-top: 10px; min-height: 60px; background: #fff; border-radius: 5px; }
                .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <h1>Relatório de Visita Técnica</h1>
            
            ${imagemHtml}

            <div class="info">
                <p><strong>Farmácia ID:</strong> ${dados.farmacia_id}</p>
                <p><strong>Avaliador ID:</strong> ${dados.avaliador_id}</p>
                <p><strong>Data da Visita:</strong> ${new Date(
                  dados.data_avaliacao
                ).toLocaleString("pt-BR")}</p>
                <div class="nota-box">Pontuação Final: ${
                  dados.pontuacao_total
                }</div>
            </div>

            <h3>Detalhamento da Avaliação</h3>
            <table>
                <thead><tr><th width="70%">Item Avaliado</th><th width="30%">Situação</th></tr></thead>
                <tbody>
                    ${dados.respostas
                      .map(
                        (r) => `
                        <tr>
                            <td>${r.pergunta}</td>
                            <td><strong>${r.avaliacao}</strong></td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>

            <h3 style="margin-top: 30px;">Observações Finais</h3>
            <div class="obs">${
              dados.observacoes || "Nenhuma observação registrada."
            }</div>

            <div class="footer">
                Relatório gerado automaticamente pelo Sistema SincoFarma.
            </div>
        </body>
        </html>
    `;

  const file = { content: conteudoHTML };

  const options = {
    format: "A4",
    printBackground: true,
    margin: { top: 20, bottom: 20, left: 20, right: 20 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  return html_to_pdf.generatePdf(file, options);
};
