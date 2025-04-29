import { Link } from "react-router-dom";
import useDocumentTitle from "../utils/useDocumentTitle";
import Footer from "../components/Footer";

const Home = () => {
  useDocumentTitle("ConectaVidas");
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm">
        <div className="container">
          <Link to="/" className="navbar-brand">ConectaVidas</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* <li className="nav-item"> 
                 <Link className="nav-link" to="/">Início</Link>
              // </li>
              // <li className="nav-item">
              //   <Link className="nav-link" to="/sobre">Sobre</Link>
              // </li>
              */}
              <li className="nav-item">
                <Link className="nav-item btn btn-entrar px-4" to="/login">Entrar</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Seção Hero */}
      <header className="hero">
        <div className="container text-center">
          <h1 className="display-4 text-light">Bem-vindo à ConectaVidas</h1>
          <p className="lead text-light">Uma plataforma para criar conexões verdadeiras e significativas.</p>
          <Link to="/cadastro" className="btn btn-gradiente mt-3">Junte-se a nós</Link>
        </div>
      </header>

      {/* Seção 1 */}
      <section className="features py-5">
        <div className="container">
          <h2 className="text-center mb-5">Por que escolher a ConectaVidas?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon">🌎</div>
                <h3 className="feature-title">Comunidade Vibrante</h3>
                <p>Participe de um ambiente amigável e acolhedor.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon">🤝</div>
                <h3 className="feature-title">Amizades Verdadeiras</h3>
                <p>Construa laços significativos com quem compartilha seus interesses.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon">🔒</div>
                <h3 className="feature-title">Segurança</h3>
                <p>Privacidade e segurança estão no centro da nossa plataforma.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2 */}
      <section className="intergenerational-section">
        <div className="container">
          <div className="image-container">
            <img src="/img/img1.jpeg" alt="Jovem, adulto e idoso juntos" className="responsive-image" />
          </div>
          <div className="text-container">
            <h2>Conectando Gerações</h2>
            <p>Usamos a tecnologia para unir jovens, adultos e idosos, promovendo conexões que enriquecem vidas e fortalecem a sociedade. Descubra como você pode fazer parte desta missão!</p>
            <Link to="#learn-more" className="cta-button">Saiba Mais</Link>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Home;
