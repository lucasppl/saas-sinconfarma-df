import nodemailer from "nodemailer";

// Configuração de Teste (Ethereal)
// O Nodemailer cria uma conta temporária se não passarmos nada, mas vamos fixar uma aqui
// Se quiser usar Gmail depois, é só mudar aqui.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "joshuah.rempel@ethereal.email", // Usuário de teste gerado
    pass: "v1t2S1X3D45s6Y7z89", // Senha de teste
  },
});

// Se a conta acima expirar, descomente a linha abaixo para gerar uma nova na hora (só para dev)
// nodemailer.createTestAccount().then(account => { /* log account */ });

export const enviarEmailComAnexo = async (emailDestino, dados, pdfBuffer) => {
  // Tenta criar conta de teste na hora se a fixa falhar (garantia)
  let testAccount = await nodemailer.createTestAccount();
  const mailer = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await mailer.sendMail({
    from: '"Sistema SincoFarma" <noreply@sincofarma.com>',
    to: emailDestino, // O email que você passar
    subject: `Relatório de Avaliação - Farmácia ${dados.farmacia_id}`,
    text: "Olá, segue em anexo o relatório técnico da visita realizada.",
    html: `
            <div style="font-family: Arial;">
                <h2 style="color: #2962ff;">Relatório Disponível</h2>
                <p>A visita na farmácia <strong>${dados.farmacia_id}</strong> foi concluída.</p>
                <p>A pontuação final foi: <strong>${dados.pontuacao_total}</strong>.</p>
                <br>
                <p>Baixe o PDF em anexo para ver os detalhes.</p>
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

  console.log("📨 E-mail enviado com sucesso!");
  // Este link é mágico: ele abre uma caixa de entrada fake para você ver o email que acabou de enviar!
  console.log(
    "🔗 CLIQUE AQUI PARA VER O EMAIL:",
    nodemailer.getTestMessageUrl(info)
  );

  return info;
};
