const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dataNascimento: {
        type: Date,
        required: true,
    },
    descricao: {
        type: String,
        required: false,
    },
    profileImage: {
        type: String, // URL da imagem de perfil
        default: ''
    },
    interesses: {
        type: [String],
        default: []
    },

    // Lista de amigos
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// Criar o índice de texto no campo 'name'
userSchema.index({ name: 'text' });

// Criptografar a senha do usuário
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para verificar a senha
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Criar o modelo de usuário
const User = mongoose.model('User', userSchema);
module.exports = User;