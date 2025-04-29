import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SlMenu } from "react-icons/sl";
import useDocumentTitle from "../utils/useDocumentTitle";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Conversations = () => {
  useDocumentTitle("ConectaVidas - Mensagens");
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages/conversations/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data);
      } catch (error) {
        console.error("Erro ao buscar conversas:", error);
      }
    };

    fetchConversations();
  }, [navigate]);

  const openChat = async (userId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/messages/mark-as-read/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Erro ao marcar mensagens como lidas:", error);
    }
  
    navigate(`/chat/${userId}`);
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
            <h1>Mensagens</h1>
            
            </div>

            {/* Menu Toggle */}
            <button className="btn btn-primary d-lg-none" id="menu-toggle" onClick={toggleSidebar}>
              <SlMenu/>
            </button>
          </header>

          <div className="conversations-container">
            {conversations.length === 0 ? (
              <p className="conversas-empty text-nowrap mt-2">Ainda não há mensagens.</p>
            ) : (
              <ul className="conversations-list">
                {conversations.map((conv) => (
                  <li
                    key={conv.userId}
                    className="conversation-item"
                    onClick={() => openChat(conv.userId)}
                  >
                    <div className="conversation-left">
                      <img
                        src={conv.profileImage || '/img/perfil.png'}
                        alt="Foto"
                        className="conversation-img"
                      />
                      <div className="conversation-info">
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="conversation-name mb-0">{conv.name}</p>
                            {conv.unreadCount > 0 && (
                              <span className="badge bg-primary rounded-pill ms-2">{conv.unreadCount}</span>
                            )}
                        </div>
                        <p className="conversation-text">{conv.text.length > 21 ? `${conv.text.slice(0, 21)}...` : conv.text}</p>
                      </div>
                    </div>
                    <span className="conversation-time">
                      {new Date(conv.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default Conversations;
