const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("password");
const loginBtn = document.getElementById("btn-login");
const errorContainer = document.getElementById("error-container");

const usuarios = [
    { email: 'editor@cejurfgv.com.br', senha: 'Cejur1', role: 'editor' },
    { email: 'usuario@cejurfgv.com.br', senha: 'Cejur2', role: 'usuario' }
];

loginBtn.addEventListener('click', function() {
    errorContainer.innerHTML = '';

    const email = emailInput.value;
    const senha = senhaInput.value;

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        mostrarErro("Credenciais inválidas.");
        return;
    }

    localStorage.setItem('userRole', usuario.role);
    window.location.href = 'index.html';
});

function mostrarErro(mensagem) {
    const erroDiv = document.createElement("div");
    erroDiv.className = "error-message";
    erroDiv.textContent = mensagem;
    errorContainer.appendChild(erroDiv);

    setTimeout(() => {
        erroDiv.style.opacity = "1";
    }, 100);

    setTimeout(() => {
        erroDiv.style.opacity = "0";
        setTimeout(() => {
            erroDiv.remove();
        }, 500);
    }, 3000);
}
