/*
  Este arquivo gerencia todas as interações no painel de Usuários (usuarios.html):
  1. LISTAGEM: Busca dados dos usuários na API (GET)
  2. CADASTRO: Envia novos usuários (com Telefone) para a API (POST)
  3. EXCLUSÃO: Deleta usuários da API (DELETE)
  4. EDIÇÃO: Abre modal e envia atualizações (com Telefone e Status) (PUT)
  5. PESQUISA: Filtra a tabela localmente
  6. MÁSCARA: Aplica a formatação de telefone (DDD)
*/

document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:8000/api/usuarios';

    // Elementos do Formulário de Cadastro e Tabela
    const tabelaCorpo = document.getElementById('tabela-corpo-usuarios');
    const formNovoUsuario = document.getElementById('form-novo-usuario');
    const formMensagemEl = document.getElementById('form-mensagem');
    const btnLogout = document.getElementById('btn-logout');
    const filtroBusca = document.getElementById('filtro-busca');

    // Elementos do Modal de Edição
    const modalEditar = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    const formEditarUsuario = document.getElementById('form-editar-usuario');
    const btnSalvarEdicao = document.getElementById('btn-salvar-edicao');
    const idUsuarioEdicao = document.getElementById('id-edicao');

    // Campos de Telefone
    const inputTelefoneNovo = document.getElementById('telefone');
    const inputTelefoneEdicao = document.getElementById('edit-telefone');

    // Variável para guardar a lista completa
    let listaUsuariosCompleta = [];

    /**
     * Aplica a máscara de telefone (DD) 9XXXX-XXXX ou 9999-9999.
     * @param {Event} e - Evento de input do campo.
     */
    function aplicarMascaraTelefone(e) {
        let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito

        // Verifica se o campo é o Telefone ou Telefone de Edição
        if (e.target.id === 'telefone' || e.target.id === 'edit-telefone') {
            // (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
            if (valor.length > 0) {
                valor = '(' + valor;
            }
            if (valor.length > 3) {
                valor = valor.substring(0, 3) + ') ' + valor.substring(3);
            }
            if (valor.length > 10) {
                valor = valor.substring(0, 10) + '-' + valor.substring(10, 15);
            } else if (valor.length > 9 && valor.length <= 10) {
                 // Formato antigo (8 dígitos)
                valor = valor.substring(0, valor.length - 4) + '-' + valor.substring(valor.length - 4);
            }
        }
        e.target.value = valor;
    }

    // Aplica a máscara aos campos
    inputTelefoneNovo.addEventListener('input', aplicarMascaraTelefone);
    inputTelefoneEdicao.addEventListener('input', aplicarMascaraTelefone);

    /**
     * @function carregarUsuarios
     * Busca a lista de usuários na API e preenche a tabela.
     */
    async function carregarUsuarios() {
        tabelaCorpo.innerHTML = '<tr><td colspan="6" class="text-center">Carregando usuários...</td></tr>';

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.error || 'Falha ao carregar usuários.');
            }

            const usuarios = await response.json();
            listaUsuariosCompleta = usuarios; // Armazena a lista completa
            renderizarTabela(usuarios); // Renderiza a tabela

        } catch (err) {
            tabelaCorpo.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${err.message}</td></tr>`;
        }
    }

    /**
     * @function renderizarTabela
     * Constrói e exibe as linhas da tabela com base em uma lista filtrada.
     * @param {Array} usuarios - Lista de usuários a serem exibidos.
     */
    function renderizarTabela(usuarios) {
        tabelaCorpo.innerHTML = '';

        if (usuarios.length === 0) {
            tabelaCorpo.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        usuarios.forEach(user => {
            const tr = document.createElement('tr');

            // Traduz o boolean 'ativo' para um Badge visual (Ativo/Inativo)
            const statusBadge = user.ativo
                ? `<span class="badge bg-success">Ativo</span>`
                : `<span class="badge bg-danger">Inativo</span>`;

            // Adiciona o 'data-user' para facilitar a busca de dados no modal de edição
            tr.dataset.user = JSON.stringify(user);

            tr.innerHTML = `
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.telefone || 'N/A'}</td> <!-- Exibe Telefone -->
                <td>${user.role_nome}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary btn-editar" data-id="${user.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${user.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tabelaCorpo.appendChild(tr);
        });
    }

    // Lógica de Pesquisa/Filtro

    filtroBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();

        // Filtra pelo nome, email, telefone ou tipo de role
        const usuariosFiltrados = listaUsuariosCompleta.filter(user =>
            user.nome.toLowerCase().includes(termo) ||
            user.email.toLowerCase().includes(termo) ||
            (user.telefone && user.telefone.includes(termo)) ||
            user.role_nome.toLowerCase().includes(termo)
        );

        renderizarTabela(usuariosFiltrados);
    });

    // Lógica de Cadastro (POST)

    formNovoUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();

        formMensagemEl.textContent = '';
        formMensagemEl.className = '';
        const submitButton = formNovoUsuario.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const dados = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value.replace(/\D/g, ''), // Envia SÓ NÚMEROS
            senha: document.getElementById('senha').value,
            role_id: parseInt(document.getElementById('role_id').value, 10),
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // Lógica de Edição (PUT) e Exclusão (DELETE)

    tabelaCorpo.addEventListener('click', async (e) => {
        const btnExcluir = e.target.closest('.btn-excluir');
        const btnEditar = e.target.closest('.btn-editar');

        // Ação de EXCLUSÃO (DELETE)
        if (btnExcluir) {
            const id = btnExcluir.dataset.id;

            if (!confirm(`Tem certeza que deseja excluir o usuário ID ${id}?`)) {
                return;
            }

            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
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

        // Ação de EDIÇÃO (Abrir Modal)
        if (btnEditar) {
            const tr = btnEditar.closest('tr');
            const userData = JSON.parse(tr.dataset.user);

            // Preenche o modal com os dados atuais do usuário
            document.getElementById('edit-nome').value = userData.nome;
            document.getElementById('edit-email').value = userData.email;
            document.getElementById('edit-telefone').value = userData.telefone || ''; // Preenche o telefone
            document.getElementById('edit-role_id').value = userData.role_id;
            document.getElementById('edit-ativo').checked = userData.ativo;
            idUsuarioEdicao.value = userData.id;

            // Se houver telefone, aplica a máscara ao campo de edição (para o usuário ver formatado)
            if (userData.telefone) {
                inputTelefoneEdicao.value = userData.telefone;
                aplicarMascaraTelefone({ target: inputTelefoneEdicao });
            }

            modalEditar.show();
        }
    });

    // Lógica de Submissão do Modal de Edição (PUT)

    formEditarUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();

        btnSalvarEdicao.disabled = true;
        btnSalvarEdicao.textContent = 'Salvando...';

        const id = idUsuarioEdicao.value;
        const dados = {
            nome: document.getElementById('edit-nome').value,
            email: document.getElementById('edit-email').value,
            // Envia SÓ NÚMEROS ou string vazia para o Backend
            telefone: document.getElementById('edit-telefone').value.replace(/\D/g, ''),
            role_id: parseInt(document.getElementById('edit-role_id').value, 10),
            ativo: document.getElementById('edit-ativo').checked
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao salvar edição.');
            }

            alert(`Usuário ${data.nome} atualizado com sucesso!`);
            modalEditar.hide();
            carregarUsuarios(); // Recarrega a tabela com as mudanças

        } catch (err) {
            alert(`Erro na atualização: ${err.message}`);
        } finally {
            btnSalvarEdicao.disabled = false;
            btnSalvarEdicao.textContent = 'Salvar Alterações';
        }
    });

    // --- Lógica de Sair (Logout) ---
    btnLogout.addEventListener('click', () => {
        // Redireciona para o login
        window.location.href = 'login.html';
    });

    carregarUsuarios();
});
