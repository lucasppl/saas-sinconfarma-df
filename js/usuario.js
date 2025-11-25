document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:8000/api/usuarios";

  // 1. Verifica login
  const usuarioSalvo = JSON.parse(localStorage.getItem("usuario"));

  if (!usuarioSalvo) {
    window.location.href = "login.html";
    return;
  }

  let usuario;

  try {
    const response = await fetch(`${API_URL}/${usuarioSalvo.id}`);
    if (!response.ok) throw new Error("Erro ao carregar dados");
    usuario = await response.json();
  } catch (err) {
    console.warn("Usando dados locais de fallback.");
    usuario = usuarioSalvo;
  }

  const formatarTelefone = (fone) => {
    if (!fone) return "Telefone não cadastrado";

    let limpo = fone.toString().replace(/\D/g, "");

    if (
      limpo.startsWith("55") &&
      (limpo.length === 12 || limpo.length === 13)
    ) {
      limpo = limpo.substring(2);
    }

    if (limpo.length === 11) {
      return limpo.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    if (limpo.length === 10) {
      return limpo.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    if (limpo.length > 11) {
      const ajustado = limpo.slice(-11);
      return ajustado.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    return fone;
  };

  const nameElement = document.querySelector(".profile__name");
  if (nameElement) nameElement.textContent = usuario.nome;

  const emailElement = document.querySelector(".profile__email");
  if (emailElement) {
    const iconSvg = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>`;
    emailElement.innerHTML = `${iconSvg} ${usuario.email}`;
  }

  // 5. Preenche Telefone Formatado
  const phoneElement = document.querySelector(".profile__phone");
  if (phoneElement) {
    const iconSvg = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.201l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>`;

    phoneElement.innerHTML = `${iconSvg} ${formatarTelefone(usuario.telefone)}`;
  }

  // 6. Logout
  const btnLogout = document.querySelector(".btn--secondary");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      window.location.href = "login.html";
    });
  }
});
