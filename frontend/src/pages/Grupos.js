import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { SlMenu } from "react-icons/sl";
import useDocumentTitle from "../utils/useDocumentTitle";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Group = () => {
  useDocumentTitle("ConectaVidas - Grupos");
  const [groups, setGroups] = useState([]); // Todos os grupos
  const [userGroups, setUserGroups] = useState([]); // Grupos que o usuário é membro
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [visibleGroups, setVisibleGroups] = useState(4); // Inicialmente mostra 4 grupos

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    image: null
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchGroups = async () => {
      try {
        const allGroups = await axios.get(`${process.env.REACT_APP_API_URL}/groups/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myGroups = await axios.get(`${process.env.REACT_APP_API_URL}/groups/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setGroups(allGroups.data);
        setUserGroups(myGroups.data);
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
      }
    };

    fetchGroups();
  }, [token, navigate]);

  const handleCreateGroup = async () => {
    if (loading) return; // Evita múltiplos envios

    if (newGroup.image) {
      const file = newGroup.image;
      const fileType = file.type;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

      if (!allowedTypes.includes(fileType)) {
        Swal.fire({
          icon: 'error',
          title: 'Erro!',
          text: 'Por favor, selecione uma imagem válida (JPG, JPEG, PNG).',
        });
        setNewGroup({ ...newGroup, image: null });
        document.querySelector('input[type="file"]').value = '';
        return; // Impede o envio do formulário
      }
    }

    setLoading(true); // Inicia o carregamento

    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append("name", newGroup.name);
      formData.append("description", newGroup.description);

      if (newGroup.image) {
        formData.append("image", newGroup.image);
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/groups/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      Swal.fire("Sucesso!", "Grupo criado com sucesso", "success");

      // Atualizar o estado para refletir o novo grupo
      setGroups((prevGroups) => [...prevGroups, response.data]);
      setUserGroups((prevUserGroups) => [...prevUserGroups, response.data]);

      handleCloseModal();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erro desconhecido. Tente novamente.');
        Swal.fire("Erro", error.response?.data?.message || "Erro ao criar grupo", "error");
      }
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewGroup({ name: "", description: "", image: null });
    setPreviewImage(null);
    setErrorMessage('');
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualizar os grupos do usuário após ele entrar
      const updatedUserGroups = await axios.get(`${process.env.REACT_APP_API_URL}/groups/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserGroups(updatedUserGroups.data);

      Swal.fire("Sucesso!", "Você entrou no grupo!", "success");
    } catch (error) {
      console.error("Erro ao participar do grupo:", error);
      Swal.fire("Erro", error.response?.data?.message || "Erro ao participar do grupo", "error");
    }
  };

  const leaveGroup = async (groupId, groupName) => {
    Swal.fire({
      title: `Você tem certeza que quer sair do grupo ${groupName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, sair!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/groups/${groupId}/leave`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Atualizar os grupos do usuário após sair
          const updatedUserGroups = await axios.get(`${process.env.REACT_APP_API_URL}/groups/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserGroups(updatedUserGroups.data);

          Swal.fire("Você não é mais membro!", "success");
        } catch (error) {
          console.error("Erro ao sair do grupo:", error);
          Swal.fire("Erro", error.response?.data?.message || "Erro ao sair do grupo", "error");
        }
      }
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isMember = (groupId) => userGroups.some(g => g._id === groupId);

  // Filtrando os grupos que o usuário já é membro
  const userGroupsFiltered = groups.filter(group => isMember(group._id));

  // Filtrando os grupos que o usuário NÃO é membro
  const availableGroups = groups.filter(group => !isMember(group._id));

  return (
    <div>
      <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <aside className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <Sidebar />
        </aside>

        <main className="main-content">
          <header className="dashboard-header d-flex justify-content-between align-items-center">
            <h1>Grupos</h1>
            <button className="btn btn-success" onClick={() => setShowModal(true)}>Criar novo grupo</button>
            <button className="btn btn-primary d-lg-none" onClick={toggleSidebar}>
              <SlMenu />
            </button>
          </header>

          <div className="text-end mb-3">

            {/* Modal */}
            {showModal && (
              <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Criar Grupo</h5>
                      <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                    </div>
                    {errorMessage && <p className="text-danger text-center mt-3 mb-0">{errorMessage}</p>}
                    <div className="modal-body">
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Nome do grupo"
                        value={newGroup.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          if (name.length <= 30) {
                            setNewGroup({ ...newGroup, name });
                          }
                        }}
                      />
                      <textarea
                        className="form-control"
                        placeholder="Descrição (30-40 caracteres)"
                        value={newGroup.description}
                        onChange={(e) => {
                          const description = e.target.value;
                          if (description.length <= 45) {
                            setNewGroup({ ...newGroup, description });
                          }
                        }}
                      />
                      <div>
                        <small>{newGroup.description.length} / 45 caracteres</small>
                      </div>
                      <input
                        type="file"
                        className="form-control mt-3"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setNewGroup({ ...newGroup, image: file });
                      
                          // Gerar a URL temporária para exibição da imagem
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {/* Exibir a imagem pré-visualizada */}
                      {previewImage && (
                        <div className="mt-3">
                          <img
                            src={previewImage}
                            alt="Pré-visualização"
                            style={{
                              width: '100%',
                              height: '390px',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                      <button
                        className="btn btn-primary"
                        onClick={handleCreateGroup}
                        disabled={loading}
                      >
                        {loading ? "Criando..." : "Criar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exibindo Meus Grupos */}
          <h2 className='group-title'>Meus Grupos</h2>
          {userGroupsFiltered.length === 0 ? (
            <p className="groups-empty text-nowrap mt-2">Você ainda não é membro de nenhum grupo.</p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {userGroupsFiltered.map(group => (
                <div className="col" key={group._id}>
                  <div className="card group-card-info shadow-sm">
                    <img src={group.image || "/img/imageGroup.png"} className="card-img-top" alt="Imagem do grupo" />
                    <div className="card-body">
                      <h5 className="card-title">{group.name}</h5>
                      <p className="card-text">{group.description}</p>
                      <div className="row">
                        <button className="btn btn-primary mb-2" onClick={() => navigate(`/grupo/${group._id}`)}>Ver</button>
                        <button className="btn btn-danger" onClick={() => leaveGroup(group._id, group.name)}>Sair</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exibindo Grupos Disponíveis */}
          <h2 className='group-title mt-5'>Grupos Disponíveis</h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {availableGroups.slice(0, visibleGroups).map(group => (
              <Link to={`/grupo/${group._id}`} className="text-decoration-none text-reset d-flex">
              <div className="col" key={group._id}>
                <div className="card group-card-info shadow-sm">
                  <img src={group.image || "/img/imageGroup.png"} className="card-img-top" alt="Imagem do grupo" />
                  <div className="card-body">
                    <h5 className="card-title">{group.name}</h5>
                    <p className="card-text">{group.description}</p>
                    <button className="btn btn-outline-primary w-100" onClick={() => handleJoinGroup(group._id)}>Participar</button>
                  </div>
                </div>
              </div>
              </Link>
            ))}
          </div>

          {/* Botão para mostrar mais grupos */}
          {visibleGroups < availableGroups.length && (
            <div className="text-center mt-4">
              <button className="btn btn-primary" onClick={() => setVisibleGroups(visibleGroups + 4)}>
                Mostrar Mais
              </button>
            </div>
          )}

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Group;