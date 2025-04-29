const Group = require('../models/Group');
const User = require('../models/User');
const { cloudinary, upload } = require('../config/cloudinary');

// Criar um novo grupo
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // Obtém o ID do usuário autenticado

    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "group_images",
        use_filename: true,
        unique_filename: false,
      });

      imageUrl = result.secure_url;
    }

    if (!name) {
      return res.status(400).json({ message: 'Digite o nome do grupo.' });
    }

    // Verificando o tamanho do nome
    if (description.length < 5) {
      return res.status(400).json({ message: 'O nome deve ter no mínimo 5 caracteres.' });
    }

    if (!description) {
      return res.status(400).json({ message: 'Escreva uma breve descrição do grupo.' });
    }

    // Verificando o tamanho da descrição
    if (description.length < 30 || description.length > 45) {
      return res.status(400).json({ message: 'A descrição deve ter entre 30 e 45 caracteres.' });
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Insira uma imagem representativa para o grupo.' });
    }

    const newGroup = new Group({
      name,
      description,
      image: imageUrl,
      creator: userId,
      members: [userId], // O criador já entra como membro
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar o grupo", error });
  }
};

// Listar todos os grupos
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar os grupos", error });
  }
};

// Entrar em um grupo
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Grupo não encontrado" });

    if (group.members.includes(userId))
      return res.status(400).json({ message: "Você já é membro deste grupo" });

    group.members.push(userId);
    await group.save();

    res.status(200).json({ message: "Você entrou no grupo com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao entrar no grupo", error });
  }
};

// Ver grupos do usuário
exports.getUserGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const groups = await Group.find({ members: userId });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar grupos do usuário", error });
  }
};

// Ver um grupo específico
exports.getGroupById = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId)
      .populate("creator", "name")
      .populate("members", "name profileImage");

    if (!group) return res.status(404).json({ message: "Grupo não encontrado" });

    const isMember = group.members.some(member => member._id.toString() === req.user._id.toString());

    res.status(200).json({
      ...group.toObject(),
      isMember
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar grupo", error });
  }
};

// Sair de um grupo
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Grupo não encontrado" });

    // Verificar se o usuário já é membro do grupo
    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "Você não é membro deste grupo" });
    }

    // Remover o usuário da lista de membros
    group.members = group.members.filter((member) => member.toString() !== userId);

    await group.save();
    res.status(200).json({ message: "Você saiu do grupo" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao sair do grupo", error });
  }
};