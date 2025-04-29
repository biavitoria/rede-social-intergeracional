const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cloudinary, upload } = require('../config/cloudinary');

// Cadastro de usuário
exports.registerUser = async (req, res) => {
    const { name, email, password, dataNascimento, descricao } = req.body;
  
    try {
        // Validação de idade (mínimo 8 anos e máximo 112 anos)
        const today = new Date();
        const birthDate = new Date(dataNascimento);
        const age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();
        const day = today.getDate() - birthDate.getDate();

        if (age < 8 || age > 112 || (age === 8 && month < 0) || (age === 8 && month === 0 && day < 0)) {
            return res.status(400).json({ message: 'Data de nascimento inválida.' });
        }

        // Validação de senha (mínimo de 5 caracteres)
        if (password.length < 5) {
            return res.status(400).json({ message: 'Senha tem que ter no mínimo 5 caracteres.' });
        }

        // Verificar se o usuário já existe
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Email já cadastrado!' });
        }

        // Criar um novo usuário
        const user = new User({
            name,
            email,
            password,
            dataNascimento,
            descricao,
        });

        await user.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor.', error: err.message });
    } 
};

// Login de usuário
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Verificar se o usuário existe
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({message: 'Email não cadastrado!'});
        } else if (user && !(await user.matchPassword(password))) {
            return res.status(400).json({message: 'Senha incorreta!'});
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login bem-sucedido!',
            token,
            name: user.name,
        });

    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// Atualizar o perfil de um usuário
exports.updateUser = async (req, res) => {
    const { name, idade, descricao } = req.body;  // Campos que permitem serem atualizados

    try {
        // Verifica se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        // Verifica se o ID do usuário logado é o mesmo do perfil que está sendo editado
        if (user._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Você não tem permissão para editar este perfil" });
        }

        // Atualizar os campos
        user.name = name || user.name;  // Se o campo não for passado, mantém o valor atual
        user.idade = idade || user.idade;
        user.descricao = descricao || user.descricao;

        // Salvar as atualizações no banco de dados
        await user.save();

        res.status(200).json({ message: 'Perfil atualizado com sucesso!', user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar perfil.' });
    }
};

// Excluir o perfil de um usuario
exports.deleteUser = async (req, res) => {
    const userId = req.userId; // ID do usuário da sessão (verificação do JWT)

    try {
        // Verificar se o usuário existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado!' });
        }

        // Excluir o usuário
        await user.deleteOne();
        res.status(200).json({ message: 'Usuário excluído com sucesso!' });
    
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// Atualizar imagem de perfil e salvar no Cloudinary
exports.uploadProfileImage = async (req, res) => {
    try {
        // Verifica se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        // Verifica se o ID do usuário logado é o mesmo do perfil que está alterando a imagem
        if (user._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Você não tem permissão para alterar a imagem deste perfil" });
        }

        // Verifica se um arquivo foi enviado
        if (!req.file) {
            return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
        }

        // Se o usuário já tem uma imagem de perfil, exclui a imagem anterior
        if (user.profileImage) {
            const cloudinaryId = user.profileImage.split('/').pop().split('.')[0]; // Extrai o public_id diretamente

            try {
                // Exclui a imagem anterior usando o public_id
                const result = await cloudinary.uploader.destroy(`profile_pictures/${cloudinaryId}`);

            } catch (error) {
                console.log("Erro ao tentar excluir a imagem do Cloudinary:", error);
            }
        }

        // Faz o upload da imagem para o Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "profile_pictures",
            use_filename: true,
            unique_filename: false,
        });

        // Salva a URL e o cloudinaryId no banco de dados
        user.profileImage = uploadResult.secure_url;
        user.cloudinaryId = req.file.filename;

        await user.save();

        return res.json({ profileImage: user.profileImage });

    } catch (error) {
        console.error("Erro ao atualizar imagem de perfil:", error);
        return res.status(500).json({ error: "Erro ao atualizar imagem de perfil" });
    }
};

// Atualizar a lista de interesses
exports.updateInteresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interesses } = req.body;

    if (!Array.isArray(interesses)) {
      return res.status(400).json({ message: "Interesses deve ser um array de strings." });
    }

    const user = await User.findById(userId);
    user.interesses = interesses;
    await user.save();

    res.json({ interesses: user.interesses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar interesses." });
  }
};
// Obter perfil do usuário
exports.getProfile = async (req, res) => {
    try {
        // Verifica se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({ message: 'Erro ao obter informações do perfil.' });
    }
};

// Pesquisar usuários pelo nome
exports.getUsers = async (req, res) => {
    try {
        const { name } = req.query;
        
        // Verifica se o nome foi passado e se tem pelo menos 3 caracteres
        if (!name || name.length < 3) {
            return res.status(400).json({ message: 'A busca deve conter pelo menos 3 caracteres' });
        }

        // Valida se o nome contém apenas letras, espaços, acentos e til
        if (!/^[a-zA-Zà-úÀ-Ú\sãõçáéíóú]*$/.test(name)) {
            return res.status(400).json({ message: 'O nome só pode conter letras e espaços' });
        }

        // Remove espaços extras antes e depois do nome
        const cleanedName = name.trim();

        // 1. Busca por correspondência exata (nome igual ao que foi digitado)
        const exactMatches = await User.find({
            name: { $regex: `^${cleanedName}$`, $options: 'i' } // Busca por nome exato
        }).select('_id name profileImage');

        // 2. Caso haja correspondência exata, retorna esses primeiros
        if (exactMatches.length > 0) {
            return res.status(200).json(exactMatches);
        }

        // 3. Busca por correspondência que comecem com o nome fornecido
        const startsWithMatches = await User.find({
            name: { $regex: `^${cleanedName}`, $options: 'i' } // Busca por nomes que começam com o termo
        }).select('_id name profileImage');

        // 4. Busca por relevância (se não houver exatas ou nomes que comecem com o termo)
        const relevantMatches = await User.find({
            $text: { $search: cleanedName } // Busca por relevância
        }).select('_id name profileImage')
        .sort({ score: { $meta: 'textScore' } }); // Ordena pela pontuação de relevância

        // 5. Combina as buscas: Exact, Starts with, Relevância
        let finalResults = [...exactMatches, ...startsWithMatches, ...relevantMatches];

        // 6. Remove duplicatas: evita que um mesmo usuário apareça mais de uma vez
        finalResults = finalResults.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t._id.toString() === value._id.toString()
            ))
        );

        // Se não houver resultados, retorna mensagem de erro
        if (finalResults.length === 0) {
            return res.status(404).json({ message: 'Nenhum usuário encontrado' });
        }

        // Retorna os resultados finalizados
        return res.status(200).json(finalResults);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
};

// Pegar usuário pelo ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};