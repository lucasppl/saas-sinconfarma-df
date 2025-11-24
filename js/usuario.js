document.addEventListener('DOMContentLoaded', async () => {

    const API_URL = 'http://localhost:8000/api/usuarios';

    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioSalvo) {
        // Se não existir, volta pro login
        window.location.href = 'login.html';
        return;
    }

    let usuario;


    function formatTelefone(valor) {
        valor = String(valor).replace(/\D/g, "");

        if (valor.length === 11) {
            return valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (valor.length === 10) {
            return valor.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }

        return valor;
    }

    try {
        
        const response = await fetch(`${API_URL}/${usuarioSalvo.id}`);

        if (!response.ok) {
            throw new Error('Erro ao carregar dados do usuário.');
        }

        usuario = await response.json();

    } catch (err) {
        console.warn('Falha ao buscar usuário no banco, usando dados locais.');
        usuario = usuarioSalvo; // fallback caso o backend não responda
    }

    //  Preenche nome
    document.querySelector('.profile__name').textContent = usuario.nome;

    //  Preenche email
    document.querySelector('.profile__email').innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        ${usuario.email}
    `;

    // Preenche telefone (se existir)
    document.querySelector('.profile__phone').innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.201l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        ${usuario.telefone ? formatTelefone(usuario.telefone) : 'Telefone não cadastrado'}
    `;

    // Logout
    document.querySelector('.btn--secondary').addEventListener('click', () => {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    });
});
