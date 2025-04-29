const Post = require('../models/Post');
const Group = require('../models/Group');
const { cloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

// Criar uma nova postagem dentro de um grupo
exports.createPost = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const userId = req.user.id;

    // Validando se os campos obrigatórios estão presentes
    if (!groupId || !content) {
      return res.status(400).json({ message: "Group ID e conteúdo são obrigatórios." });
    }

    // Verificando se o grupo existe
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Grupo não encontrado" });

    // Verificando se o usuário é membro do grupo
    if (!group.members.includes(userId))
      return res.status(403).json({ message: "Você não é membro deste grupo" });

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'post_images',
        use_filename: true,
        unique_filename: false,
      });
      imageUrl = result.secure_url;
    }

    // Criando o novo post
    const newPost = new Post({
      group: groupId,
      author: userId,
      content,
      image: imageUrl,
      createdAt: new Date(),
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar a postagem", error });
  }
};

// Buscar postagens de um grupo específico
exports.getPostsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verificando se o groupId é válido
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "ID do grupo inválido." });
    }

    // Verificando se o grupo existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado." });
    }

    // Buscando as postagens do grupo
    const posts = await Post.find({ group: groupId })
      .populate("author", "name profileImage")
      .populate("comments.user", "name profileImage")
      .populate("comments.replies.user", "name profileImage");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar as postagens", error });
  }
};

// Curtir uma postagem
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Postagem não encontrada" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((like) => like.toString() !== userId);
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Erro ao curtir a postagem", error });
  }
};

// Comentar em uma postagem
exports.commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    // Verificar se o texto do comentário foi enviado
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Texto do comentário é obrigatório." });
    }

    // Verificar se o postId é válido
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "ID da postagem inválido." });
    }

    // Buscar a postagem no banco de dados
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Postagem não encontrada" });
    }

    post.comments.push({ user: userId, text });
    await post.save();

    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: "Erro ao comentar na postagem", error: error.message });
  }
};

// Responder a um comentário
exports.replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    // Verificar se o texto da resposta foi enviado
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Texto da resposta é obrigatório." });
    }

    // Verificar se o postId é válido
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "ID da postagem inválido." });
    }

    // Verificar se o commentId é válido
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "ID do comentário inválido." });
    }

    const post = await Post.findById(postId);
    // Se a postagem não for encontrada
    if (!post) return res.status(404).json({ message: "Postagem não encontrada" });

    // Buscar o comentário na postagem
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ message: "Comentário não encontrado" });

    comment.replies.push({ user: userId, text });
    await post.save();

    res.status(201).json(comment.replies);
  } catch (error) {
    res.status(500).json({ message: "Erro ao responder o comentário", error });
  }
};