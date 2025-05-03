import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useDocumentTitle from "../utils/useDocumentTitle";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import { SlMenu } from "react-icons/sl";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";

const Profile = () => {
  useDocumentTitle("ConectaVidas - Perfil");
  const { id } = useParams(); // Pega o ID do usuário na URL
  const { user: loggedUser } = useAuth(); // Obtém os dados do usuário logado
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const defaultProfileImage = "/img/profile.png";
  const [profileImage, setProfileImage] = useState(defaultProfileImage);
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");
  const navigate = useNavigate();

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  // Verifica se o usuário logado está vendo o próprio perfil
  const isOwnProfile = !id || id === loggedUser?._id;

  // Função para buscar os dados do perfil do usuário
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const url = id
          ? `${process.env.REACT_APP_API_URL}/users/${id}` // Buscar perfil de outro usuário
          : `${process.env.REACT_APP_API_URL}/users/perfil`; // Buscar perfil próprio

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;
        setUser(userData);
        setNewDescription(userData.descricao || "");
        setProfileImage(userData.profileImage || defaultProfileImage);
        setInterests(userData.interesses || []);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };

    fetchUserProfile();
  }, [id, navigate]);

  // Função para realizar o upload da imagem de perfil
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verifica se o arquivo é uma imagem
    const fileType = file.type.split("/")[0];
    if (fileType !== "image") {
      Swal.fire({
        icon: 'error',
        title: 'Arquivo inválido',
        text: 'Por favor, selecione uma imagem para o upload.',
      });
      return;
    }

    // Atualiza a imagem localmente antes de iniciar o upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result); // Atualiza a imagem imediatamente no frontend
    };
    reader.readAsDataURL(file);

    // Inicia o upload sem bloquear a interface
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/upload-imagem-perfil`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Atualiza a URL da imagem no frontend após o upload
      const updatedImageUrl = response.data.profileImage;
      setProfileImage(updatedImageUrl);
      setUser((prevUser) => ({ ...prevUser, profileImage: updatedImageUrl }));

    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    }
  };

  // Função para ativar o modo de edição da descrição
  const handleDescriptionEdit = () => {
    setIsEditingDescription(true);
  };

  // Função para salvar a descrição editada
  const handleDescriptionSave = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/update`,
        { descricao: newDescription },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser((prevUser) => ({ ...prevUser, descricao: newDescription }));
      
      // Mensagem de sucesso
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Descrição Atualizada!",
        showConfirmButton: false,
        timer: 1700
      });

      setIsEditingDescription(false); // Fecha o modo de edição
      
    } catch (error) {
      console.error("Erro ao atualizar descrição:", error);
    }
  };

  // Função para alterar o valor da descrição
  const handleDescriptionChange = (event) => {
    setNewDescription(event.target.value);
  };

  // Função para calcular a idade com base na data de nascimento
  const calculateAge = (dob) => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    // Ajusta a idade caso o aniversário ainda não tenha ocorrido neste ano
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Função para nova lista de interesses ao backend
  const saveInterests = async (newList) => {
    const token = sessionStorage.getItem("token");
    const res = await axios.put(
      `${process.env.REACT_APP_API_URL}/users/interesses`,
      { interesses: newList },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setInterests(res.data.interesses);
  };

  // Função para adicionar um interesse
  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      saveInterests([...interests, trimmed]);
      setNewInterest("");
    }
  };

  // Remover um interesse
  const handleRemoveInterest = (interest) => {
    saveInterests(interests.filter(i => i !== interest));
  };

  // Função para alternar a visibilidade da sidebar
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
              <h1>{isOwnProfile ? "Meu Perfil" : "Perfil de " + (user?.name || "")}</h1>
            </div>

            {/* Menu Toggle */}
            <button className="btn btn-primary d-lg-none" id="menu-toggle" onClick={toggleSidebar}>
              <SlMenu/>
            </button>
          </header>
          
          <section className="profile-container">
            {/* Card de Imagem de Perfil */}
            <div className="perfil-preview">
              {/* Cabeçalho com Nome e Badge de Idade */}
              <div className="name-perfil-preview">
                <div className="preview-nome">
                  <h2 id="nome" className="profile-name">
                    {user?.name || "Nome não informado"}
                  </h2>
                </div>
                <div className="infos-perfil-preview">
                  <div className="idade">
                    {user?.dataNascimento ? calculateAge(user.dataNascimento) : ""}
                  </div>
                </div>
              </div>

              {/* Área de Imagem */}
              <div className="imagem-perfil">
                <img
                  id="primeira-imagem"
                  src={profileImage}
                  alt="Profile"
                  className="profile-image"
                  onError={(e) => (e.target.src = defaultProfileImage)}
                />
              </div>

              {/* Botão de Edição (apenas se for o perfil do usuário) */}
              {isOwnProfile && (
                <div className="info-perfil-preview">
                  <label htmlFor="fileInput" className="edit-button ms-3 pt-1">
                    Editar Foto<FaPencilAlt className="edit-icon ms-2 me-1" /> 
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </div>
              )}
            </div>

            {/* Nome */}
            <div className="profile-info">
              <h2 className="profile-name">{user?.name || "Nome não informado"}</h2>
          
              {/* Descrição */}
              <div className="profile-description">
                {isOwnProfile ? (
                  isEditingDescription ? (
                    <>
                      <textarea
                        className="profile-description-input"
                        value={newDescription}
                        onChange={handleDescriptionChange}
                        rows={3}
                      />
                      <button onClick={handleDescriptionSave}>Salvar</button>
                    </>
                  ) : (
                    <>
                      <p>{user?.descricao || "Sem descrição"}</p>
                      <button onClick={handleDescriptionEdit}>Editar Descrição</button>
                    </>
                  )
                ) : (
                  <p>{user?.descricao || "Sem descrição"}</p>
                )}
              </div>

              {isOwnProfile ? (
                <>
                  {/* Amigos */}
                  <p className="profile-friends">
                    <Link to="/conexoes" className="text-reset">{user ? user.friends.length : 0} amigos </Link>
                  </p>
                </>
              ) : (
                <>
                  <p className="profile-friends text-reset">
                    {user ? user.friends.length : 0} amigos
                  </p>
                </>
              )}

            </div>
          </section>

          <section className="interesses-container container-interesses">
            <div className="container-interesses-title">
              Interesses
            </div>

            <div className="box-interesses">
              {interests.map(i => (
                <div key={i} className="tags">
                  {i}
                  {isOwnProfile && (
                    <span 
                      className="remove-tag" 
                      onClick={() => handleRemoveInterest(i)}
                      style={{ cursor: 'pointer', marginLeft: '4px' }}
                    >×</span>
                  )}
                </div>
              ))}
            </div>

            {isOwnProfile && (
              <div className="add-interest">
                <div className="input-button-interesses">
                  <input
                    type="text"
                    placeholder="Digite um interesse. Exemplo: 'Jardinagem'"
                    value={newInterest}
                    onChange={e => {
                      const onlyLetters = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
                      setNewInterest(onlyLetters);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleAddInterest()}
                    maxLength={20}
                    className="input-interest"
                  />
                  <button 
                    onClick={handleAddInterest} 
                    disabled={!newInterest.trim()}
                    className="btn-add-interest"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer/>
    </div>
  );
};

export default Profile;