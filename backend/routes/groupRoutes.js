const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/auth');

// Rota para criar um grupo
router.post("/create", authMiddleware, upload.single('image'), groupController.createGroup);

// Rota para listar os grupos
router.get("/all", authMiddleware, groupController.getGroups);

// Rota para listar os grupos do usuário
router.get("/me", authMiddleware, groupController.getUserGroups);

// Rota para buscar grupo específico
router.get("/:groupId", authMiddleware, groupController.getGroupById);

// Rota para participar de um grupo
router.post("/:groupId/join", authMiddleware, groupController.joinGroup);

// Rota para sair de um grupo
router.post("/:groupId/leave", authMiddleware, groupController.leaveGroup);

module.exports = router;