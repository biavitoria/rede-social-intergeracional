const User = require("../models/User");

// Enviar solicitação de amizade
exports.sendFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.body; // ID do usuário para quem será enviada a solicitação
        const userId = req.user.id; // ID do usuário logado

        if (userId === friendId) {
            return res.status(400).json({ error: "Você não pode se adicionar como amigo." });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verifica se já são amigos ou se já há uma solicitação pendente
        if (user.friends.includes(friendId)) {
            return res.status(400).json({ error: "Esse usuário já é seu amigo." });
        }

        if (user.friendRequestsSent.includes(friendId)) {
            return res.status(400).json({ error: "Solicitação já enviada." });
        }

        if (friend.friendRequestsSent.includes(userId)) {
            return res.status(400).json({ error: "Esse usuário já enviou uma solicitação para você. Aceite a solicitação." });
        }

        // Adiciona a solicitação na lista de pendentes
        user.friendRequestsSent.push(friendId);
        friend.friendRequestsReceived.push(userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Solicitação de amizade enviada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar solicitação de amizade." });
    }
};

// Aceitar solicitação de amizade
exports.acceptFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verifica se a solicitação realmente existe
        if (!user.friendRequestsReceived.includes(friendId)) {
            return res.status(400).json({ error: "Nenhuma solicitação de amizade encontrada." });
        }

        // Adiciona um ao outro na lista de amigos
        user.friends.push(friendId);
        friend.friends.push(userId);

        // Remove as solicitações pendentes
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== friendId);
        friend.friendRequestsSent = friend.friendRequestsSent.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Amizade aceita com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao aceitar solicitação de amizade." });
    }
};

// Recusar solicitação de amizade
exports.rejectFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verifica se a solicitação realmente existe
        if (!user.friendRequestsReceived.includes(friendId)) {
            return res.status(400).json({ error: "Nenhuma solicitação de amizade encontrada." });
        }

        // Remove a solicitação de amizade
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== friendId);
        friend.friendRequestsSent = friend.friendRequestsSent.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Solicitação de amizade recusada." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao recusar solicitação de amizade." });
    }
};

// Remover amigo
exports.removeFriend = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verificar se o usuário e o amigo já são amigos
        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ error: "Vocês não são amigos." });
        }

        // Remove um ao outro da lista de amigos
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Amizade removida com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao remover amigo." });
    }
};

// Listar amigos do usuário
exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate("friends", "name profileImage");

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        res.status(200).json(user.friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar lista de amigos." });
    }
};

// Listar solicitações pendentes
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate("friendRequestsReceived", "name profileImage");

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        res.status(200).json(user.friendRequestsReceived);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar solicitações pendentes." });
    }
};

// Listar todos os usuários (excluindo o usuário logado)
exports.getAllUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const users = await User.find({ _id: { $ne: userId } });

        const user = await User.findById(userId);

        const usersWithRequests = users.map((u) => ({
            _id: u._id,
            name: u.name,
            profileImage: u.profileImage,
            requestSent: user.friendRequestsSent.includes(u._id), // Adiciona a flag se já foi enviada solicitação
        }));

        res.status(200).json(usersWithRequests);
    } catch (error) {
        console.error("Erro ao buscar usuários", error);
        res.status(500).json({ error: "Erro ao buscar usuários." });
    }
};