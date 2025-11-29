document.addEventListener("DOMContentLoaded", () => {
  // 1. Pega o ID da avaliação da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Validação
  if (!id) {
    alert("Erro: ID da avaliação não encontrado.");
    window.location.href = "../../html/usuarios.html";
    return;
  }

  // Elementos da tela
  const loadingDiv = document.getElementById("loading");
  const readyDiv = document.getElementById("ready");
  const btnEnviar = document.getElementById("btnEnviar");

  // 2. Simula um tempo de "Processamento" (2 segundos)
  setTimeout(() => {
    loadingDiv.style.display = "none";
    readyDiv.style.display = "block";
  }, 2000);

  // 3. Função Global para baixar o PDF (chamada pelo onclick no HTML)
  window.baixar = function () {
    // Abre a rota do backend que gera e devolve o PDF
    window.open(`http://localhost:8000/api/avaliacoes/${id}/pdf`, "_blank");
  };

  // 4. Lógica do Botão Enviar Email
  btnEnviar.addEventListener("click", async () => {
    // Feedback visual
    btnEnviar.disabled = true;
    btnEnviar.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Enviando...';

    try {
      // Chama a rota do backend que gera o PDF e manda por e-mail
      const res = await fetch(
        `http://localhost:8000/api/avaliacoes/${id}/email`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        alert("✅ Sucesso! O relatório foi enviado para o cliente.");
        // Volta para a tela inicial
        window.location.href = "../../html/usuario.html";
      } else {
        const err = await res.json();
        alert("Erro ao enviar: " + (err.error || "Erro desconhecido"));

        // Restaura botão em caso de erro
        btnEnviar.disabled = false;
        btnEnviar.innerHTML =
          '<i class="fa-solid fa-paper-plane"></i> Tentar Novamente';
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão com o servidor.");

      btnEnviar.disabled = false;
      btnEnviar.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> Tentar Novamente';
    }
  });
});
