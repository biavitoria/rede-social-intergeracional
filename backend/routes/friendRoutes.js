const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const authMiddleware = require("../middleware/auth");

// Rota para enviar solicitação de amizade
router.post("/send", authMiddleware, friendController.sendFriendRequest);

// Rota para aceitar solicitação de amizade
router.post("/accept", authMiddleware, friendController.acceptFriendRequest);

// Rota para recusar solicitação de amizade
router.post("/reject", authMiddleware, friendController.rejectFriendRequest);

// Rota para remover um amigo
router.post("/remove", authMiddleware, friendController.removeFriend);

// Rota para listar os amigos do usuário
router.get("/list", authMiddleware, friendController.getFriends);

// Rota para listar as solicitações de amizade pendentes
router.get("/pending", authMiddleware, friendController.getPendingRequests);

// Rota para listar todos os usuários
router.get("/users", authMiddleware, friendController.getAllUsers);

module.exports = router;