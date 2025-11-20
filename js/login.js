document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-login');
    const emailInput = document.getElementById('emailInput');
    const senhaInput = document.getElementById('passwordInput');
    const mensagemDiv = document.getElementById('login-mensagem');
    const submitButton = document.getElementById('btn-submit');

    const API_LOGIN_URL = 'http://localhost:8000/api/login';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'Autenticando...';
        mensagemDiv.textContent = '';
        mensagemDiv.className = 'mt-3 text-center';

        const dadosLogin = {
            email: emailInput.value,
            senha: senhaInput.value
        };

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosLogin)
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                mensagemDiv.textContent = `Login bem-sucedido! Bem-vindo(a), ${data.usuario.nome}.`;
                mensagemDiv.classList.add('text-success');

                setTimeout(() => {
                    window.location.href = 'usuario.html';
                }, 1500);

            } else {
                throw new Error(data.error);
            }

        } catch (err) {
            mensagemDiv.textContent = `Erro: ${err.message}`;
            mensagemDiv.classList.add('text-danger');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });

    const toggleButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');

    toggleButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        toggleButton.classList.toggle('active');
    });
});
