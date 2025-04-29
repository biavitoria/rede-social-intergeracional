const API_URL = "http://localhost:5000";

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        return response.json();
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        return { error: "Erro ao conectar com o servidor." };
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        return response.json();
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        return { error: "Erro ao conectar com o servidor." };
    }
};
