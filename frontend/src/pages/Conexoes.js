import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import useDocumentTitle from "../utils/useDocumentTitle";
import Swal from 'sweetalert2';
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { SlMenu } from "react-icons/sl";
import { FaUser, FaUserPlus, FaCheckCircle, FaQuestionCircle, FaTimesCircle, FaComment } from "react-icons/fa";

const Conexoes = () => {
    useDocumentTitle("ConectaVidas - Conexões");
    const [amigos, setAmigos] = useState([]);
    
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
    const [userId, setUserId] = useState(null);
    
    const [busca, setBusca] = useState('');
    const [buscaRealizada, setBuscaRealizada] = useState(false);
    const [quantidadeExibidaBusca, setQuantidadeExibidaBusca] = useState(4);
    const [ setErroBusca ] = useState('');
    
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [solicitacoesEnviadas, setSolicitacoesEnviadas] = useState([]);
    
    const [quantidadeExibida, setQuantidadeExibida] = useState(5);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setQuantidadeExibidaBusca(4);
        setBuscaRealizada(false);
        setUsuariosEncontrados([]); 

        buscarAmigos();
        buscarSolicitacoesPendentes();
        buscarUsuarios();

        const token = sessionStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica o JWT token
            setUserId(decodedToken.id);
        }

        if (busca.trim() !== '') {
            setBuscaRealizada(false);
        }
    }, [busca, navigate]); // Sempre que o nome da busca mudar, limpa os resultados

    // Função para validar se a entrada contém apenas letras e espaços
    const handleInputChange = (e) => {
        const value = e.target.value;

        // Expressão regular para permitir apenas letras e espaços
        if (/^[a-zA-Zà-úÀ-Ú\sãõçáéíóú]*$/.test(value)) {
            setBusca(value);
        }
    };

    const handleSearch = () => {
        if (busca.trim().length < 3) return;

        // Normaliza a busca para remover acentos
        const buscaNormalizada = busca.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos
    
        setBuscaRealizada(true);
        setUsuariosEncontrados([]);
    
        const token = sessionStorage.getItem("token");
    
        if (!token) {
            console.error('Token não encontrado');
            return;
        }
    
        // Realiza a busca na API
        axios
            .get(`${process.env.REACT_APP_API_URL}/users/search?name=${buscaNormalizada}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                if (response.data.length === 0) {
                    setErroBusca('Nenhum usuário encontrado');
                } else {
                    setUsuariosEncontrados(response.data);
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar usuários:', error);
                setUsuariosEncontrados([]);
            });
    };

    const buscarAmigos = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/friends/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAmigos(res.data);
        } catch (error) {
            console.error("Erro ao buscar amigos", error);
        }
    };

    const excluirAmizade = async (friendId, nomeAmigo) => {
        const resultado = await Swal.fire({
            title: `Você tem certeza que quer desfazer a amizade com ${nomeAmigo}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (resultado.isConfirmed) {
            try {
                const token = sessionStorage.getItem("token");
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/friends/remove`,
                    { friendId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Atualiza a lista de amigos após remover
                buscarAmigos();
                Swal.fire('Amizade removida!', '', 'success');
            } catch (error) {
                console.error("Erro ao remover amizade", error);
                Swal.fire('Erro!', 'Não foi possível remover a amizade.', 'error');
            }
        }
    };

    const mostrarTodos = () => {
        setQuantidadeExibida(amigos.length);
    };

    const buscarSolicitacoesPendentes = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/friends/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSolicitacoes(res.data);
        } catch (error) {
            console.error("Erro ao buscar solicitações", error);
        }
    };

    const buscarUsuarios = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/friends/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsuarios(res.data);

             // Atualiza a lista de solicitações enviadas com base no que já foi enviado no backend
            const enviados = res.data
                .filter((usuario) => usuario.requestSent) // Filtra só os que já receberam solicitação
                .map((usuario) => usuario._id);

            setSolicitacoesEnviadas(enviados);
        } catch (error) {
            console.error("Erro ao buscar usuários", error);
        }
    };

    const enviarSolicitacao = async (friendId) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_URL}/friends/send`,
                { friendId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Atualiza o estado para desativar o botão
            setSolicitacoesEnviadas((prev) => [...prev, friendId]);

            buscarUsuarios();
        } catch (error) {
            console.error("Erro ao enviar solicitação", error);
        }
    };

    const aceitarAmizade = async (friendId) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_URL}/friends/accept`,
                { friendId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            buscarAmigos();
            buscarSolicitacoesPendentes();
        } catch (error) {
            console.error("Erro ao aceitar amizade", error);
        }
    };

    const recusarAmizade = async (friendId) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_URL}/friends/reject`,
                { friendId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            buscarSolicitacoesPendentes();
        } catch (error) {
            console.error("Erro ao recusar amizade", error);
        }
    };

    const mostrarMais = () => {
        setQuantidadeExibida((prevQuantidade) => prevQuantidade + 3);
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
                            <h1>Conexões</h1>
                        </div>

                        {/* Menu Toggle */}
                        <button className="btn btn-primary d-lg-none" id="menu-toggle" onClick={toggleSidebar}>
                            <SlMenu/>
                        </button>
                    </header>

                    {/* Buscar Usuários */}
                    <section className="busca-container">
                        <div>
                            <h4>Buscar Usuários</h4>
                            <input
                                type="text"
                                placeholder="Digite o nome do usuário"
                                value={busca}
                                onChange={handleInputChange}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="form-control mb-3"
                            />
                            <button 
                                onClick={handleSearch} 
                                className="btn btn-primary mb-3"
                                disabled={busca.trim().length < 3}
                            >
                                Buscar
                            </button>
                        </div>

                        <div>
                            {buscaRealizada && usuariosEncontrados.length > 0 ? (
                                <article className="conexoes-busca">
                                    {usuariosEncontrados.slice(0, quantidadeExibidaBusca).map(usuario => (
                                        <div key={usuario.id} className="conexao-busca-item">
                                            <Link to={`/perfil/${usuario._id}`} className="text-decoration-none text-reset d-flex align-items-center">
                                                <img src={usuario.profileImage || "/img/perfil.png"} alt={usuario.name} />
                                                <div className="conexoes-name">
                                                    <p>{usuario.name}</p>
                                                </div>
                                            </Link>
                                            
                                            {/* Se o usuário for o próprio */}
                                            {usuario._id === userId ? (
                                                <button className="conexoes-button conexoes-profile">
                                                    <Link to="/profile" className="text-decoration-none text-reset"><FaUser /> Meu Perfil</Link>
                                                </button>

                                            ) :  //Verifica se o usuário já é amigo
                                                amigos.some((amigo) => amigo._id === usuario._id) ? (
                                                <div className="conexoes-buttons">
                                                    <button className="conexoes-button conexoes-message">
                                                        <Link to={`/chat/${usuario._id}`} className="text-decoration-none text-reset">
                                                            <FaComment /> Mensagem
                                                        </Link>
                                                    </button>
                                                <button className="conexoes-button conexoes-friend">
                                                    <FaCheckCircle /> Amigo
                                                </button>
                                                </div>
                                            ) : (
                                                // Verifica se a pessoa já enviou uma solicitação
                                                solicitacoes.some((solicitacao) => solicitacao._id === usuario._id) ? (
                                                    <button className="conexoes-button conexoes-pending" disabled title="Essa pessoa já enviou uma solicitação de amizade para você. Aceite ou recuse em 'Solicitações Pendentes'.">
                                                        <FaQuestionCircle /> Pendente                            
                                                    </button>
                                                ) : (
                                                    <button className={`conexoes-button ${solicitacoesEnviadas.includes(usuario._id) ? "conexoes-sent" : "conexoes-add"}`}
                                                        onClick={() => enviarSolicitacao(usuario._id)}
                                                        disabled={solicitacoesEnviadas.includes(usuario._id)}
                                                    >
                                                        {solicitacoesEnviadas.includes(usuario._id) ? <FaCheckCircle /> : <FaUserPlus />}
                                                        {solicitacoesEnviadas.includes(usuario._id) ? " Solicitado" : " Adicionar"}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </article>
                                
                            ) : buscaRealizada && usuariosEncontrados.length === 0 ? (
                                <p>Nenhum usuário encontrado</p>
                            ) : null}

                            {quantidadeExibidaBusca < usuariosEncontrados.length && (
                                <div className="ver-todos-container">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setQuantidadeExibidaBusca(usuariosEncontrados.length)}
                                    >
                                        Ver todos
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Meus Amigos */}
                    <div className="conexoes-content">
                        <h2>Meus Amigos</h2>
                        <div className="conexoes-card-grid">
                            {amigos.length > 0 ? (
                                amigos.slice(0, quantidadeExibida).map((amigo) => (
                                   <div key={amigo._id} className="conexoes-card">
                                        <Link to={`/perfil/${amigo._id}`} className="text-decoration-none text-reset">
                                            <img src={amigo.profileImage || "/img/perfil.png"} alt={amigo.name} />
                                            <p>{amigo.name}</p>
                                        </Link>
                                        <div className="conexoes-buttons flex-column">
                                            <button className="conexoes-button conexoes-message">
                                                <Link to={`/chat/${amigo._id}`} className="text-decoration-none text-reset">
                                                    <FaComment /> Mensagem
                                                </Link>
                                            </button>
                                            <button className="conexoes-button conexoes-delete" onClick={() => excluirAmizade(amigo._id, amigo.name)}>
                                                <FaTimesCircle /> Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="conexoes-empty text-nowrap">Você ainda não tem amigos.</p>
                            )}
                        </div>

                        {/* "Mostrar todos" se houver mais amigos para exibir */}
                        {quantidadeExibida < amigos.length && (
                            <button className="mostrar-mais" onClick={mostrarTodos}>
                                Mostrar todos os amigos
                            </button>
                        )}

                        {/* Solicitações Pendentes */}
                        <h2 className="mt-5">Solicitações Pendentes</h2>
                        <article className="conexoes-solicitacoes-card-grid">
                            {solicitacoes.length > 0 ? (
                                solicitacoes.map((solicitacao) => (
                                    <div key={solicitacao._id} className="col-12 col-sm-6 col-md-5 col-lg-5 col-xl-3">
                                        <div className="conexoes-solicitacoes-card">
                                            <Link to={`/perfil/${solicitacao._id}`} className="text-decoration-none text-reset d-flex align-items-center">
                                                <img src={solicitacao.profileImage || "/img/perfil.png"} alt={solicitacao.name} className="me-3" />
                                                <div className="conexoes-name">
                                                    <p>{solicitacao.name}</p>
                                                </div>
                                            </Link>
                                            <div className="conexoes-buttons d-flex flex-column">
                                                <button className="conexoes-button conexoes-accept" onClick={() => aceitarAmizade(solicitacao._id)}>
                                                    <FaCheckCircle /> Aceitar
                                                </button>
                                                <button className="conexoes-button conexoes-reject" onClick={() => recusarAmizade(solicitacao._id)}>
                                                    <FaTimesCircle /> Recusar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="conexoes-empty">Nenhuma solicitação pendente.</p>
                            )}
                        </article><br />

                        {/* Pessoas no ConectaVidas */}
                        <h2>Pessoas no ConectaVidas</h2>
                        <article className="conexoes-lista">
                            {usuarios.length > 0 ? (
                                usuarios.slice(0, quantidadeExibida).map((usuario) => (
                                    <div key={usuario._id} className="conexao-item">
                                        <Link to={`/perfil/${usuario._id}`} className="text-decoration-none text-reset d-flex align-items-center">
                                            <img src={usuario.profileImage || "/img/perfil.png"} alt={usuario.name} className="me-2"/>
                                            <div className="conexoes-name">
                                                <p>{usuario.name}</p>
                                            </div>
                                        </Link>

                                        {/* Verifica se o usuário já é amigo */}
                                        {amigos.some((amigo) => amigo._id === usuario._id) ? (
                                            <button className="conexoes-button conexoes-friend">
                                                <FaCheckCircle /> Amigo
                                            </button>
                                        ) : (
                                            // Verifica se a pessoa já enviou uma solicitação
                                            solicitacoes.some((solicitacao) => solicitacao._id === usuario._id) ? (
                                                <button className="conexoes-button conexoes-pending" disabled title="Essa pessoa já enviou uma solicitação de amizade para você. Aceite ou recuse em 'Solicitações Pendentes'.">
                                                    <FaQuestionCircle /> Pendente                            
                                                </button>
                                            ) : (

                                                <button className={`conexoes-button ${solicitacoesEnviadas.includes(usuario._id) ? "conexoes-sent" : "conexoes-add"}`}
                                                    onClick={() => enviarSolicitacao(usuario._id)}
                                                    disabled={solicitacoesEnviadas.includes(usuario._id)}
                                                >
                                                    {solicitacoesEnviadas.includes(usuario._id) ? <FaCheckCircle /> : <FaUserPlus />}
                                                    {solicitacoesEnviadas.includes(usuario._id) ? " Solicitado" : " Adicionar"}
                                                </button>
                                            )
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="conexoes-empty">Nenhum usuário disponível.</p>
                            )}

                        </article>
                        
                        {/* Mostrar o botão apenas se houver mais usuários para exibir */}
                        {quantidadeExibida < usuarios.length && (
                            <button className="mostrar-mais" onClick={mostrarMais}>
                                Mostrar mais
                            </button>
                        )}
                    </div>
                </main>
            </div>

        <Footer/>
    </div>
  );
};

export default Conexoes;