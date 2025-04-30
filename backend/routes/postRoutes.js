const express = require('express');
const router = express.Router();
const uploadPost = require("../middleware/uploadPost");
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

// Rota para criar nova postagem
router.post("/", authMiddleware, uploadPost.single('image'), postController.createPost);

// Rota para listar postagens de um grupo
router.get("/:groupId", authMiddleware, postController.getPostsByGroup);

// Rota para curtir postagem
router.post("/:postId/like", authMiddleware, postController.likePost);

// Rota para comentar postagem
router.post("/:postId/comment", authMiddleware, postController.commentOnPost);

// Rota para responder comentário
router.post("/:postId/comment/:commentId/reply", authMiddleware, postController.replyToComment);

module.exports = router;