const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Enviar mensagem
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id; // Pegamos o ID do usuário autenticado
    const { receiverId, text } = req.body;

    if (!receiverId || !text || text.trim() === "") {
      return res.status(400).json({ message: "Destinatário e mensagem são obrigatórios." });
    }

    // Verificar se o destinatário existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Criar e salvar a mensagem
    const message = new Message({ senderId, receiverId, text });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
};

// Buscar mensagens entre dois usuários
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id; // O ID do usuário autenticado
    const { senderId, receiverId } = req.params;

    // Verifica se os IDs são válidos no MongoDB
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "ID de usuário inválido." });
    }

    // Verifica se os usuários existem no banco de dados
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Verifica se o usuário autenticado faz parte da conversa
    if (userId !== senderId && userId !== receiverId) {
      return res.status(403).json({ message: "Acesso negado. Você não tem permissão para ver essas mensagens." });
    }

    // Busca as mensagens entre os dois usuários
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar mensagens' });
  }
};

// Buscar últimas mensagens de cada conversa do usuário
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: objectUserId },
            { receiverId: objectUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", objectUserId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      // $lookup para contar mensagens não lidas
      {
        $lookup: {
          from: "messages",
          let: { contactId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderId", "$$contactId"] },
                    { $eq: ["$receiverId", objectUserId] },
                    { $eq: ["$isRead", false] }
                  ]
                }
              }
            },
            { $count: "count" }
          ],
          as: "unread"
        }
      },
      {
        $addFields: {
          unreadCount: {
            $cond: [
              { $gt: [{ $size: "$unread" }, 0] },
              { $arrayElemAt: ["$unread.count", 0] },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          name: "$userInfo.name",
          profileImage: "$userInfo.profileImage",
          text: "$lastMessage.text",
          createdAt: "$lastMessage.createdAt",
          unreadCount: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar conversas' });
  }
};

// Marcar mensagens como lidas
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "ID de remetente inválido." });
    }

    const result = await Message.updateMany(
      {
        senderId,
        receiverId: userId,
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.json({ message: 'Mensagens marcadas como lidas', updatedCount: result.modifiedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao marcar mensagens como lidas' });
  }
};

exports.deleteMessagesBetweenUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: "ID do amigo inválido." });
    }

    // Verifica se o usuário existe
    const friendExists = await User.findById(friendId);
    if (!friendExists) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Verifica se existem mensagens entre os usuários
    const existingMessages = await Message.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    });

    if (existingMessages.length === 0) {
      return res.status(404).json({ message: "Nenhuma mensagem encontrada entre os usuários." });
    }

    // Deleta as mensagens
    const result = await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    });

    res.json({ message: "Mensagens apagadas com sucesso", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Erro ao apagar mensagens:", error);
    res.status(500).json({ message: "Erro interno ao apagar mensagens." });
  }
};