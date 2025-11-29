import nodemailer from "nodemailer";

// --- CONFIGURAÇÃO DO GMAIL ---
// Importante: Você precisa usar uma "Senha de App" gerada nas configurações da sua conta Google.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pablohenriquesouzaa@gmail.com",
    pass: "pcvg mwkf eikz cugr",
  },
});

export const enviarEmailComAnexo = async (emailDestino, dados, pdfBuffer) => {
  try {
    console.log("📨 Preparando envio pelo Gmail...");

    const info = await transporter.sendMail({
      from: '"Sistema SincoFarma" <geos.enrico89@gmail.com>', // Quem envia
      to: emailDestino, // Quem recebe
      subject: `Relatório de Avaliação - Farmácia ${dados.farmacia_id}`,
      text: "Olá, segue em anexo o relatório técnico da visita realizada.",
      html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #2962ff;">Relatório Disponível</h2>
                <p>A visita na farmácia <strong>${dados.farmacia_id}</strong> foi concluída com sucesso.</p>
                <p><strong>Pontuação Final:</strong> ${dados.pontuacao_total}</p>
                <hr>
                <p>Baixe o PDF em anexo para ver os detalhes completos.</p>
                <br>
                <small>Enviado automaticamente pelo Sistema SincoFarma.</small>
            </div>
        `,
      attachments: [
        {
          filename: `Relatorio_Visita_${dados.farmacia_id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("✅ E-mail enviado com sucesso! ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail pelo Gmail:", error);
    throw error; // Repassa o erro para o controller saber que falhou
  }
};
