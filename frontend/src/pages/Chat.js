import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import useDocumentTitle from "../utils/useDocumentTitle";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Swal from 'sweetalert2';
import { FaTrash } from "react-icons/fa";
import { SlMenu } from "react-icons/sl";
import { io } from "socket.io-client";
import { FaCheck, FaClock, FaTimes } from "react-icons/fa";

const Chat = () => {
  useDocumentTitle("ConectaVidas - Chat");
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [friendInfo, setFriendInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const socket = io(process.env.REACT_APP_SOCKET_URL); // Conecta ao servidor Socket.io

  // Captura o ID do usuário logado
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica o JWT token
      setUserId(decodedToken.id); // Salva o userId
      console.log("userId do token:", decodedToken.id); // Verificando o userId
    } else {
      console.error("Erro: usuário não autenticado.");
      navigate("/login"); // Redireciona para login se não houver token
    }
  }, [navigate]);

  // Função para buscar informações do amigo
  const fetchFriendInfo = async (friendId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${friendId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setFriendInfo(response.data); // Atualiza o estado com as informações do amigo
    } catch (error) {
      console.error("Erro ao carregar as informações do amigo:", error);
    }
  };

  // Busca as informações do amigo quando friendId muda
  useEffect(() => {
    if (friendId) {
      fetchFriendInfo(friendId); // Chama a função para buscar as informações do amigo
    }
  }, [friendId]);

  // Conectando o socket com o userId e escutando mensagens
  useEffect(() => {
    if (userId) {
      // Emite o evento userConnected para o servidor para associar o socket ao userId
      socket.emit("userConnected", userId);
      console.log("Usuário conectado com ID:", userId);

      // Ouve as novas mensagens e atualiza a lista de mensagens
      socket.on("receiveMessage", (data) => {
        setMessages((prevMessages) => [...prevMessages, data]); // Adiciona a nova mensagem à lista
      });

      // Limpeza ao desconectar
      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [userId, socket]);

  // Carrega as mensagens ao montar o componente
  useEffect(() => {
    if (userId && friendId) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/messages/${userId}/${friendId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        })
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.error("Erro ao carregar as mensagens:", error);
        });
    }
  }, [userId, friendId]);

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".messages-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // Prevenir rolagem da página no carregamento
    window.scrollTo(0, 0);
  
    // Ajustar o tempo para rolar até o final das mensagens
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
  
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!userId || !friendId) {
      console.error("Erro: senderId ou receiverId não encontrados:", userId, friendId);
      alert("Erro: Não foi possível enviar a mensagem. Tente novamente.");
      return;
    }

    const currentMessage = message; // Guarda o conteúdo da mensagem
    const newMessage = { senderId: userId, receiverId: friendId, text: currentMessage, status: "sending", createdAt: new Date().toISOString() }; // Definindo status "sending"

    // Adiciona a mensagem à lista de mensagens localmente com status "sending"
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage(""); // Limpa o campo de texto

    try {
      // Envia a mensagem para o servidor
      await axios.post(
        `${process.env.REACT_APP_API_URL}/messages`,
        {
          senderId: userId,
          receiverId: friendId,
          text: currentMessage,
        },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        }
      );

      // Envia a mensagem para o servidor WebSocket
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId: friendId,
        text: currentMessage,
      });

      // Atualiza o status para "sent" assim que a mensagem for enviada
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.text === currentMessage ? { ...msg, status: "sent" } : msg
        )
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Se falhar, atualiza o status para "failed"
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.text === currentMessage ? { ...msg, status: "failed" } : msg
        )
      );
      alert("Erro ao enviar a mensagem. Tente novamente.");
    }
  };

  const handleDeleteConversation = async () => {
    const resultado = await Swal.fire({
      title: `Você tem certeza que quer apagar toda a conversa com ${friendInfo?.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, apagar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
  
    if (resultado.isConfirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/messages/delete/${friendId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
  
        setMessages([]);
        Swal.fire('Conversa apagada!', '', 'success');
      } catch (error) {
        console.error("Erro ao apagar mensagens:", error);
        Swal.fire('Erro', 'Não foi possível apagar a conversa. Tente novamente.', 'error');
      }
    }
  };  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <Sidebar/>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="dashboard-header d-flex justify-content-between align-items-center">
            <div>
            <h1>Bate-papo</h1>
            
            </div>

            {/* Menu Toggle */}
            <button className="btn btn-primary d-lg-none" id="menu-toggle" onClick={toggleSidebar}>
              <SlMenu/>
            </button>
          </header>


          <div className="chat-container">
            <div className="chat-header">
              <div className="friend-info">
                <img
                  src={friendInfo?.profileImage || "/img/perfilChat.png"}
                  alt="Foto de perfil"
                  className="profile-pic"
                />
                <h2>{friendInfo ? friendInfo.name : "Carregando..."}</h2>
              </div>

              <button onClick={handleDeleteConversation} className="btn btn-link text-white fs-5 mb-2" title="Apagar conversa">
                <FaTrash />
              </button>

            </div>

            <div className="messages-container">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div key={index} className={`message-wrapper ${msg.senderId === userId ? "sent-wrapper" : "received-wrapper"}`}>
                    <div className={`message ${msg.senderId === userId ? "sent" : "received"}`}>
                      <p style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
                        {msg.text}
                      </p>

                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>             

                    {/* Ícone de status alinhado à direita */}
                    <div className="message-status">
                      {msg.status === "sending" && <FaClock className="status-indicator sending" />}
                      {msg.status === "sent" && <FaCheck className="status-indicator sent" />}
                      {msg.status === "failed" && <FaTimes className="status-indicator failed" />}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-messages">Sem mensagens ainda. Envie uma para começar!</p>
              )}
              <div ref={messagesEndRef} />
            </div >

            <div className="send-message">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                maxLength={200}
              />

              <div className="character-count">
                {message.length} / 200
              </div>

              <button className="btn-send" onClick={handleSendMessage} disabled={message.trim() === ""}>
                Enviar
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default Chat;