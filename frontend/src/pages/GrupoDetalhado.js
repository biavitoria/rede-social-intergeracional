import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import useDocumentTitle from "../utils/useDocumentTitle";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { SlMenu } from "react-icons/sl";

const GrupoDetalhado = () => {
  useDocumentTitle("ConectaVidas - Grupo");
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [posts, setPosts] = useState([]);
  const [novoPost, setNovoPost] = useState('');
  const [imagemPost, setImagemPost] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [comentarios, setComentarios] = useState({});
  const [respostas, setRespostas] = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});
  const token = sessionStorage.getItem('token');
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/posts/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Erro ao carregar postagens:", err);
    }
  }, [groupId, token]);

  const fetchGroupName = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupName(res.data.name);
      setIsMember(res.data.isMember);
    } catch (err) {
      console.error("Erro ao buscar nome do grupo:", err);
    }
  }, [groupId, token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  });

  useEffect(() => {
    fetchPosts();
    fetchGroupName();
  }, [fetchPosts, fetchGroupName]);

  const handlePostar = async () => {
    if (!novoPost.trim()) return;
    try {
      const formData = new FormData();
      formData.append('content', novoPost);
      formData.append('groupId', groupId);
      if (imagemPost) {
        formData.append('image', imagemPost);
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/posts/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', 
        }
      });

      setPosts([...posts, response.data]);
      setNovoPost(''); // Limpa o conteúdo do texto
      setImagemPost(null); // Limpa a imagem após o post
      fetchPosts(); // Recarrega os posts
    } catch (err) {
      console.error("Erro ao postar:", err);
    }
  };

  const handleSairDoGrupo = async () => {
    Swal.fire({
      title: `Você tem certeza em sair do grupo "${groupName}"?`,
      text: "Você não será mais um membro.",
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

          setIsMember(false);

          Swal.fire("Você não é mais membro!", "", "success");
        } catch (error) {
          console.error("Erro ao sair do grupo:", error);
          Swal.fire("Erro", error.response?.data?.message || "Erro ao sair do grupo", "error");
        }
      }
    });
  };

  const handleEntrarNoGrupo = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Você entrou no grupo!", "", "success");
      setIsMember(true);
      fetchPosts();
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);
      Swal.fire("Erro", error.response?.data?.message || "Erro ao entrar no grupo", "error");
    }
  };

  const handleCurtir = async (postId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  const handleComentar = async (postId) => {
    const texto = comentarios[postId];
    if (!texto || !texto.trim()) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/posts/${postId}/comment`, {
        text: texto
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComentarios({ ...comentarios, [postId]: '' });
      fetchPosts();
    } catch (err) {
      console.error("Erro ao comentar:", err);
    }
  };

  const handleResponder = async (postId, commentId) => {
    const texto = respostas[commentId];
    if (!texto || !texto.trim()) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/posts/${postId}/comment/${commentId}/reply`, {
        text: texto
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRespostas({ ...respostas, [commentId]: '' });
      fetchPosts();
    } catch (err) {
      console.error("Erro ao responder:", err);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <aside className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <Sidebar />
        </aside>

        <main className="main-content">
          <header className="dashboard-header d-flex justify-content-between align-items-center">
            <h1>{groupName}</h1>
            <div className="d-flex align-items-center gap-2">
              {isMember ? (
                <button className="btn btn-danger" onClick={handleSairDoGrupo}>
                  Sair do grupo
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleEntrarNoGrupo}>
                  Participar do grupo
                </button>
              )}
              <button className="btn btn-primary d-lg-none" onClick={toggleSidebar}>
                <SlMenu />
              </button>
            </div>
          </header>

          {/* Área de novo post */}
          {isMember ? (
            <div className="card p-3 mb-4 shadow-sm" style={{transform: 'none'}}>
              <textarea
                className="form-control mb-2"
                placeholder="Escreva uma nova postagem..."
                value={novoPost}
                onChange={(e) => setNovoPost(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                className="form-control mb-2"
                onChange={(e) => setImagemPost(e.target.files[0])}
              />
              
              {imagemPost && (
                <div className="mb-2 text-center">
                  <img
                    src={URL.createObjectURL(imagemPost)}
                    alt="Pré-visualização"
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  />
                </div>
              )}

              <button className="btn btn-success mt-2" onClick={handlePostar}>Postar</button>
            </div>
          ) : (
            <div className="alert alert-warning">
              Você precisa ser membro do grupo para fazer postagens.
            </div>
          )}

          {/* Listagem de postagens */}
          <div className='group-card'>
            {posts.length === 0 ? (
              <p>Não há postagens neste grupo.</p>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="card mb-3 p-3 shadow-sm">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={post.author.profileImage || '/img/perfil.png'}
                      alt="Autor"
                      className="rounded-circle me-2"
                      width="40"
                      height="40"
                      />
                      <strong>{post.author.name}</strong>
                  </div>
                  <p>{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="Imagem do post" className="img-fluid rounded mb-2" style={{width: '40%'}} />
                  )}
                  <button
                    className="btn btn-primary btn-sm mb-2"
                    onClick={() => handleCurtir(post._id)}
                  >
                    Curtir ({post.likes?.length || 0})
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      setMostrarComentarios(prev => ({
                        ...prev,
                        [post._id]: !prev[post._id]
                      }))
                    }
                  >
                    {mostrarComentarios[post._id] ? "Ocultar" : "Ver comentários"}
                  </button>

                  {/* Comentários */}
                  {mostrarComentarios[post._id] && (
                    <div className="mt-3" style={{ maxHeight: '900px', overflowY: 'auto' }}>
                      <strong>Comentários:</strong>
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="border-top pt-2 mt-2">
                          <div className="d-flex align-items-center">
                            <img
                              src={comment.user.profileImage || '/img/perfil.png'}
                              alt="Usuário"
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                            />
                            <strong>{comment.user.name}</strong>
                          </div>
                          <p className="ms-4 mb-2">{comment.text}</p>

                          {comment.replies.length > 0 && (
                            <p className="fst-italic ms-4" style={{ fontWeight: 500 }}>Respostas:</p>
                          )}

                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="ms-4 border-start ps-2 mb-3">
                              <img
                                src={reply.user.profileImage || '/img/perfil.png'}
                                alt="Usuário"
                                className="rounded-circle me-2"
                                width="30"
                                height="30"
                              />
                              <strong>{reply.user.name}</strong>: {reply.text}
                            </div>
                          ))}
                          <div className="ms-4 mt-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Responder..."
                              value={respostas[comment._id] || ''}
                              onChange={(e) =>
                                setRespostas({ ...respostas, [comment._id]: e.target.value })
                              }
                            />
                            <button
                              className="btn btn-link btn-sm mt-1"
                              onClick={() => handleResponder(post._id, comment._id)}
                            >
                              Responder
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="mt-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Comentar..."
                          value={comentarios[post._id] || ''}
                          onChange={(e) =>
                            setComentarios({ ...comentarios, [post._id]: e.target.value })
                          }
                        />
                        <button
                          className="btn btn-secondary btn-sm mt-1"
                          onClick={() => handleComentar(post._id)}
                        >
                          Comentar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default GrupoDetalhado;
