import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { BiSolidUserCircle } from "react-icons/bi";
import { IoPeopleSharp } from "react-icons/io5";
import { LuMessageCircleMore } from "react-icons/lu";
import { FaUsers } from "react-icons/fa6";
import { SlMenu } from "react-icons/sl";
import useDocumentTitle from "../utils/useDocumentTitle";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Dashboard = () => {
    useDocumentTitle("ConectaVidas - Home");
    const [username, setUsername] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const user = sessionStorage.getItem('username');
        if (user) {
          setUsername(user);
        }
    }, []);

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
                            <h1>Bem-vindo(a), {username || 'Usuário'}!</h1>
                            <p className="d-none d-md-block">Conectando gerações com simplicidade.</p>
                        </div>

                        {/* Menu Toggle */}
                        <button className="btn btn-primary d-lg-none" id="menu-toggle" onClick={toggleSidebar}>
                            <SlMenu/>
                        </button>
                    </header>

                    <section className="dashboard-cards row g-4 text-center mt-4">
                        <div className="col-lg-6 col-xl-3">
                            <Link to="/profile" className="linkSemSublinhado card card-feature d-flex flex-column align-items-center justify-content-center">
                                <div className="card-icon bg-primary text-light"><BiSolidUserCircle/></div>
                                <h2 className="mt-3">Meu Perfil</h2>
                                <p>Gerencie suas informações pessoais.</p>
                            </Link>
                        </div>
                        <div className="col-lg-6 col-xl-3">
                            <Link to="/conexoes" className="linkSemSublinhado card card-feature d-flex flex-column align-items-center justify-content-center">
                                <div className="card-icon bg-success text-light"><IoPeopleSharp/></div>
                                <h2 className="mt-3">Conexões</h2>
                                <p>Explore e organize suas conexões.</p>
                            </Link>
                        </div>
                        <div className="col-lg-6 col-xl-3">
                            <Link to="/conversas" className="linkSemSublinhado card card-feature d-flex flex-column align-items-center justify-content-center">
                                <div className="card-icon bg-warning text-light"><LuMessageCircleMore/></div>
                                <h2 className="mt-3">Mensagens</h2>
                                <p>Converse com amigos e contatos.</p>
                            </Link>
                        </div>
                        <div className="col-lg-6 col-xl-3">
                            <Link to="/grupos" className="linkSemSublinhado card card-feature d-flex flex-column align-items-center justify-content-center">
                                <div className="card-icon bg-danger text-light"><FaUsers/></div>
                                <h2 className="mt-3">Grupos</h2>
                                <p>Participe de atividades e encontros.</p>
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
            <Footer/>
        </div>
    );
};

export default Dashboard;
