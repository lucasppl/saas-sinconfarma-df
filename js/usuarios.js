document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:8000/api/usuarios';

    const tabelaCorpo = document.getElementById('tabela-corpo-usuarios');
    const formNovoUsuario = document.getElementById('form-novo-usuario');
    const formMensagemEl = document.getElementById('form-mensagem');
    const btnLogout = document.getElementById('btn-logout');

    async function carregarUsuarios() {
        tabelaCorpo.innerHTML = '<tr><td colspan="5" class="text-center">Carregando usuários...</td></tr>';

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.error || 'Falha ao carregar usuários.');
            }

            const usuarios = await response.json();
            tabelaCorpo.innerHTML = ''; // Limpa o "Carregando..."

            if (usuarios.length === 0) {
                tabelaCorpo.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum usuário cadastrado.</td></tr>';
                return;
            }

            usuarios.forEach(user => {
                const tr = document.createElement('tr');

                const statusBadge = user.ativo
                    ? `<span class="badge bg-success">Ativo</span>`
                    : `<span class="badge bg-danger">Inativo</span>`;

                tr.innerHTML = `
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td>${user.role_nome}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary btn-editar" data-id="${user.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <!-- *** ATUALIZADO: Classe 'btn-excluir' e 'data-id' adicionados *** -->
                        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${user.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tabelaCorpo.appendChild(tr);
            });

        } catch (err) {
            tabelaCorpo.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${err.message}</td></tr>`;
        }
    }

    formNovoUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();

        formMensagemEl.textContent = '';
        formMensagemEl.className = '';
        const submitButton = formNovoUsuario.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        // Pega os dados do formulário
        const dados = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value,
            role_id: parseInt(document.getElementById('role_id').value, 10),
            // 'ativo' não é enviado, pois o banco de dados define 'default: true'
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro desconhecido');
            }

            formMensagemEl.textContent = `Usuário "${data.nome}" criado com sucesso!`;
            formMensagemEl.className = 'alert alert-success';
            formNovoUsuario.reset();

            carregarUsuarios(); // Recarrega a tabela

        } catch (err) {
            formMensagemEl.textContent = `Erro: ${err.message}`;
            formMensagemEl.className = 'alert alert-danger';
        } finally {
            submitButton.disabled = false;
        }
    });

    // Logout

    btnLogout.addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    tabelaCorpo.addEventListener('click', async (e) => {
        // Encontra o botão de exclusão mais próximo que foi clicado
        const btnExcluir = e.target.closest('.btn-excluir');

        if (btnExcluir) {
            const id = btnExcluir.dataset.id;

            // Pede confirmação
            if (!confirm(`Tem certeza que deseja excluir o usuário ID ${id}?`)) {
                return;
            }

            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao excluir');
                }

                alert(data.message);
                carregarUsuarios();

            } catch (err) {
                alert(`Erro: ${err.message}`);
            }
        }

    });

    // Carrega a lista de usuários assim que a página abre
    carregarUsuarios();
});
