const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('dotenv').config();
const cors = require('cors');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://conectavidas.render.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json()); // Permite que o Express entenda JSON nas requisições


// Usar as rotas
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');

app.use('/api/users', userRoutes);
app.use("/api/friends", friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);

// Conectar ao MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch((err) => {
        console.error('Erro ao conectar no MongoDB:', err);
        process.exit(1); // Encerrar o servidor em caso de falha na conexão
    });

// Suporte ao Socket.io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Permite qualquer origem
    },
});

// Armazenamento de usuários conectados
let users = {};

// Quando um usuário se conecta
io.on('connection', (socket) => {

  // Quando o usuário se conecta
  socket.on('userConnected', (userId) => {
    users[userId] = socket.id;
  });

  // Quando o usuário envia uma mensagem
  socket.on('sendMessage', (data) => {
    const { senderId, receiverId, text } = data;
    if (users[receiverId]) {
      io.to(users[receiverId]).emit('receiveMessage', {
        senderId,
        text,
        createdAt: new Date(), // pode gerar a data no server também
      });
    }
  });

  // Quando o usuário desconecta
  socket.on('disconnect', () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});


// Iniciar o servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
