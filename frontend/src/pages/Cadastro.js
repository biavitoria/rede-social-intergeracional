import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import useDocumentTitle from "../utils/useDocumentTitle";
import Swal from 'sweetalert2';

const Cadastro = () => {
  useDocumentTitle("ConectaVidas - Cadastro");
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, {
        name: nome,
        email: email,
        password: password,
        dataNascimento: dataNascimento,
      });

      // Mensagem de sucesso
      Swal.fire({
        title: "Cadastro realizado com sucesso!",
        text: "Faça o login para continuar!",
        icon: "success"
      });
  
      // Redirecionar ou exibir sucesso
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer o cadastro', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage('Erro desconhecido. Tente novamente.');
      }
    }
  };

    return (
        <div className="cadastro-container d-flex align-items-center justify-content-center">
            <div className="cadastro-card">
                <h2 className="text-center mb-4"><p style={{ color: '#7269e5' }}>Criar Conta</p></h2>
                
                {/* Exibindo a mensagem de erro, se houver */}
                {errorMessage && <p className="text-danger text-center mt-2">{errorMessage}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="nome" className="form-label">
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="nome"
                            name="nome"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="number" className="form-label">
                            Data de Nascimento
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="dataNascimento"
                            name="dataNascimento"
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="exemplo@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Senha
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="Crie uma senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-entrar w-100">
                            Cadastrar
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-muted">
                            Já possui uma conta? <a href="/login">Entre aqui</a>
                        </p>
                    </div>
                </form>
            </div>
          <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        </div>
    );
};

export default Cadastro;
