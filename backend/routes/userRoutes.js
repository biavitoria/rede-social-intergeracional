const express = require('express');
const router = express.Router();
const uploadProfile = require("../middleware/uploadProfile");
const path = require('path');
const authMiddleware = require('../middleware/auth'); // Importa o middleware de autenticação
const userController = require('../controllers/userController');

// Rota para cadastro de usuário
router.post('/register', userController.registerUser);

// Rota para login
router.post('/login', userController.loginUser);

// Rota para atualizar o perfil de um usuário
router.put('/update', authMiddleware, userController.updateUser);

// Rota para excluir o perfil de um usuario
router.delete('/delete', authMiddleware, userController.deleteUser);

// Rota para atualizar imagem de perfil
router.put('/upload-imagem-perfil', authMiddleware, uploadProfile.single('profileImage'), userController.uploadProfileImage);

// Rota para atualizar interesses
router.put('/interesses', authMiddleware, userController.updateInteresses);

// Rota para mostrar as informações do perfil do usuário
router.get('/perfil', authMiddleware, userController.getProfile);

// Rota para buscar um usuário pelo nome
router.get('/search', authMiddleware, userController.getUsers)

// Rota para mostrar um usuário pelo ID
router.get("/:id", authMiddleware, userController.getUserById);


module.exports = router;