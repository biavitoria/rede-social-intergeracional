import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import useDocumentTitle from "../utils/useDocumentTitle";

const Login = () => {
  useDocumentTitle("ConectaVidas - Login");
  const navigate = useNavigate(); // Hook para redirecionamento
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita recarregar a página
    setIsSubmitting(true);

    // Mostra o alerta de carregamento
    Swal.fire({
      title: 'Entrando...',
      text: 'Aguarde um momento',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, { 
        email, 
        password 
      });

      const token = response.data.token; // Pegando o token de resposta

      if (token) {
        sessionStorage.setItem('token', token); // Armazena o token no localStorage
        
        // Função para capitalizar corretamente, mantendo os acentos
        const capitalizeName = (name) => {
          return name
            .split(' ') // Dividir o nome em palavras
            .map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitaliza a primeira letra e deixa o resto em minúsculo
            )
            .join(' '); // Junta as palavras novamente
        };

        // Salva no localStorage o nome com a capitalização correta
        sessionStorage.setItem('username', capitalizeName(response.data.name));
        
        Swal.fire({
          title: "Bem-vindo " + sessionStorage.getItem('username') + "!",
          text: "Login realizado com sucesso!",
          icon: "success"
        });

        navigate('/dashboard');
      }
    } catch (error) {
      Swal.close(); // Fecha o loading se der erro
      setIsSubmitting(false);
      console.error('Erro ao fazer o login', error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
          setErrorMessage('Erro desconhecido. Tente novamente.');
      }
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100">
      <div className="login-card">
        <h2 className="text-center mb-4">Login</h2>
        {/* Exibir a mensagem de erro caso existam credenciais inválidas */}
        {errorMessage && <p className="text-danger text-center mt-2">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-login-entrar w-100 d-flex justify-content-center align-items-center" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        <p className="text-muted text-center mt-3">
          Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
