(function () {
  // 1. Pega o usuário do navegador
  const usuarioString = localStorage.getItem("usuario");

  // Função para chutar o usuário para o login
  function expulsarParaLogin() {
    alert("Sessão expirada ou inválida. Faça login novamente.");
    // Ajuste o caminho conforme onde este arquivo html estiver
    window.location.href = "../login.html";
  }

  // Função para mandar para a tela de usuário comum
  function expulsarParaHome() {
    alert("Acesso Negado: Você não tem permissão de Administrador.");
    window.location.href = "usuario.html";
  }

  // --- VERIFICAÇÕES ---

  // A. Não tem nada salvo? Tchau.
  if (!usuarioString) {
    expulsarParaLogin();
    return;
  }

  try {
    const usuario = JSON.parse(usuarioString);

    // B. O objeto usuário está quebrado ou sem role? Tchau.
    if (!usuario || !usuario.role) {
      expulsarParaLogin();
      return;
    }

    // C. Normaliza o texto (transforma 'Admin' ou 'ADMIN' em 'admin')
    const cargo = usuario.role.toLowerCase();

    // D. Verifica se é admin
    // (Adicione 'administrador' se for assim que está no seu banco)
    if (cargo !== "admin" && cargo !== "administrador") {
      expulsarParaHome();
      return;
    }

    // SE CHEGOU AQUI: É Admin!
    // O script termina e deixa a página carregar normalmente.
    console.log("Acesso autorizado: Administrador identificado.");

    document.addEventListener("DOMContentLoaded", () => {
      document.body.style.display = "block"; // Ou "flex", dependendo do seu layout
    });
  } catch (e) {
    // Se der erro ao ler o JSON, limpa tudo e manda pro login
    localStorage.removeItem("usuario");
    expulsarParaLogin();
  }
})();
