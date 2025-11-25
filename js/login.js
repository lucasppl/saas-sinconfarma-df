document.addEventListener("DOMContentLoaded", () => {
  // Tenta achar o formulário
  const formLogin = document.querySelector("form");

  // --- AQUI ESTAVA O ERRO ---
  // Antes buscava por ID (#email), agora busca pelo TIPO do input
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');

  // Verificação de segurança: Se não achou os elementos, para tudo e avisa no console
  if (!formLogin || !emailInput || !passwordInput) {
    console.error(
      "ERRO CRÍTICO: O JavaScript não encontrou os campos de email ou senha no HTML."
    );
    console.log("Achou form?", !!formLogin);
    console.log("Achou email?", !!emailInput);
    console.log("Achou senha?", !!passwordInput);
    return;
  }

  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede a página de recarregar

    const email = emailInput.value;
    const senha = passwordInput.value;

    if (!email || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      console.log("Enviando dados para:", "http://localhost:8000/api/login");

      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao fazer login");
        return;
      }

      // --- SUCESSO ---
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Lógica de Redirecionamento Baseada no Cargo (Role)
      const userRole = data.usuario.role ? data.usuario.role.toLowerCase() : "";
      console.log("Login OK! Cargo:", userRole);

      if (userRole === "admin" || userRole === "administrador") {
        window.location.href = "usuarios.html";
      } else {
        window.location.href = "usuario.html";
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão com o servidor. O Backend está rodando?");
    }
  });
});
