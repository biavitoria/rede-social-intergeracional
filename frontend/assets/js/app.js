document.addEventListener("DOMContentLoaded", function () {
    // Captura o formulário de cadastro
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            // Obtém os valores dos campos
            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("${process.env.REACT_APP_API_URL}/users/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Cadastro realizado com sucesso!");
                    window.location.href = "login.html"; // Redireciona para a página de login
                } else {
                    alert(data.message || "Erro ao cadastrar. Tente novamente.");
                }
            } catch (error) {
                console.error("Erro ao cadastrar:", error);
                alert("Erro ao conectar com o servidor.");
            }
        });
    }

    // Captura o formulário de login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("${process.env.REACT_APP_API_URL}/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Login realizado com sucesso!");
                    localStorage.setItem("token", data.token); // Salva o token para sessões futuras
                    window.location.href = "index.html"; // Redireciona para a página inicial
                } else {
                    alert(data.message || "Erro ao fazer login. Verifique suas credenciais.");
                }
            } catch (error) {
                console.error("Erro ao fazer login:", error);
                alert("Erro ao conectar com o servidor.");
            }
        });
    }
});
