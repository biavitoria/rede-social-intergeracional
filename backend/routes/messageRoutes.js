const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Rota para marcar mensagem como lida
router.put('/mark-as-read/:senderId', authMiddleware, messageController.markAsRead);

// Rota para listar últimas conversas do usuário
router.get('/conversations/list', authMiddleware, messageController.getConversations);

// Rota para obter mensagens entre dois usuários
router.get('/:senderId/:receiverId', authMiddleware, messageController.getMessages);

// Rota para enviar uma mensagem
router.post('/', authMiddleware, messageController.sendMessage);

// Rota para apagar conversa com um usuário
router.delete("/delete/:friendId", authMiddleware, messageController.deleteMessagesBetweenUsers);

module.exports = router;