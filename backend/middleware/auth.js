const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Importa o modelo do usuário

module.exports = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
        }

        // Verifica o token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        next();
    } catch (error) {
        console.error("Erro na autenticação:", error);
        res.status(401).json({ error: "Token inválido." });
    }
};
