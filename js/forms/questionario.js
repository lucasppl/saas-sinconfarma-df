document.addEventListener("DOMContentLoaded", () => {
  // 1. Recupera dados de sessão
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const urlParams = new URLSearchParams(window.location.search);
  const farmaciaId = urlParams.get("farmaciaId");

  // Validação básica
  if (!usuario) {
    // alert("Sessão inválida.");
  }

  // 2. LÓGICA DE INTERAÇÃO (FORÇA BRUTA VISUAL)
  const emojiBtns = document.querySelectorAll(".emoji-btn");

  emojiBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const clickedBtn = e.currentTarget;
      const parent = clickedBtn.closest(".emoji-options");

      // Adiciona classe no pai para o CSS saber que houve seleção
      parent.classList.add("option-selected");

      // Percorre TODOS os botões daquele grupo
      parent.querySelectorAll(".emoji-btn").forEach((b) => {
        if (b === clickedBtn) {
          // --- SELECIONADO (Colorido e Vivo) ---
          b.classList.add("selected");
          b.style.filter = "grayscale(0%)";
          b.style.opacity = "1";
          b.style.transform = "scale(1.3)";
        } else {
          // --- NÃO SELECIONADO (Cinza Escuro) ---
          b.classList.remove("selected");
          b.style.filter = "grayscale(100%)";
          b.style.opacity = "0.6";
          b.style.transform = "scale(0.9)";
        }
      });

      // Remove o visual de erro
      const questionItem = clickedBtn.closest(".question-item");
      if (questionItem) {
        questionItem.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
        questionItem.style.backgroundColor = "transparent";
      }
    });
  });

  // 3. ENVIO DO FORMULÁRIO
  const form = document.getElementById("form-questionario");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const questionItems = document.querySelectorAll(".question-item");
    const respostas = [];
    let temErro = false;

    questionItems.forEach((item) => {
      const catId = item.dataset.catId;
      const textoPergunta = item.dataset.pergunta;
      const selecionado = item.querySelector(".emoji-btn.selected");

      if (selecionado) {
        respostas.push({
          categoria_id: catId,
          pergunta: textoPergunta,
          avaliacao: selecionado.dataset.value,
        });
      } else {
        temErro = true;
        item.style.borderBottom = "2px solid #ff4444";
        item.style.backgroundColor = "#fff5f5";
        item.style.borderRadius = "8px";
        item.style.padding = "10px";
      }
    });

    if (temErro) {
      alert("Por favor, responda todas as perguntas.");
      const erro = document.querySelector('.question-item[style*="rgb(255"]');
      if (erro) erro.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // --- RECUPERA A FOTO SALVA NA TELA ANTERIOR ---
    const fotoSalva = localStorage.getItem("foto_fachada");

    if (fotoSalva) console.log("Foto anexada ao pacote:", fotoSalva);
    else console.warn("Atenção: Nenhuma foto encontrada no LocalStorage.");

    // Pega o texto do textarea
    const obsTexto = document.getElementById("input-observacoes").value;

    // Monta o pacote
    const payload = {
      usuario_id: usuario ? usuario.id : 1,
      farmacia_id: farmaciaId || 1,
      foto: fotoSalva || null,
      observacoes: obsTexto,
      respostas: respostas,
    };

    console.log("Enviando Payload:", payload);

    try {
      const response = await fetch("http://localhost:8000/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // --- AQUI ESTÁ A MUDANÇA IMPORTANTE ---

        // 1. Pega a resposta do backend (que contém o ID da avaliação criada)
        const data = await response.json();

        // 2. Limpa a foto do cache
        localStorage.removeItem("foto_fachada");

        alert("Avaliação enviada com sucesso!");

        // 3. Redireciona para a tela de relatório passando o ID
        // Como estão na mesma pasta, basta o nome do arquivo
        window.location.href = `enviar_relatorio.html?id=${data.id}`;
      } else {
        const errorData = await response.json();
        alert("Erro ao salvar: " + (errorData.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão (verifique se o backend está rodando).");
    }
  });
});
