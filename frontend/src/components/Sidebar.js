import { Link, useNavigate, useLocation} from "react-router-dom";
import { PiUsersFourLight } from "react-icons/pi";
import { 
    BiHome, BiUser, BiUserVoice, BiMessageRounded, BiExit
} from "react-icons/bi";

// import { BiCog, BiHelpCircle } from "react-icons/bi";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para obter a localização atual

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="sidebar-header">
            <div className="sidebar-header d-flex align-items-center gap-2">
                <img src="/img/favicon-white.png" alt="Logo" style={{ width: "30px", height: "30px" }} />
                <h2 style={{ margin: 0 }}>ConectaVidas</h2>
            </div>
            <ul className="sidebar-menu">
                <li className={location.pathname === "/dashboard" ? "active" : ""}>
                    <Link to="/dashboard"><BiHome/>Início</Link>
                </li>
                <li className={location.pathname === "/profile" ? "active" : ""}>
                    <Link to="/profile"><BiUser/>Meu perfil</Link>
                </li>
                <li className={location.pathname === "/conexoes" ? "active" : ""}>
                    <Link to="/conexoes"><BiUserVoice/>Conexões</Link>
                </li>
                <li className={location.pathname === "/conversas" ? "active" : ""}>
                    <Link to="/conversas"><BiMessageRounded/>Mensagens</Link>
                </li>
                <li className={location.pathname === "/grupos" ? "active" : ""}>
                    <Link to="/grupos"><PiUsersFourLight/>Grupos</Link>
                </li>
                {/*
                <li><Link to=""><BiCog/>Configurações</Link></li>
                <li><Link to=""><BiHelpCircle/>Ajuda</Link></li>
                */}
                <li><Link to="/" onClick={handleLogout}><BiExit/>Sair</Link></li>
            </ul>
        </div>
            
    );
};

export default Sidebar;
