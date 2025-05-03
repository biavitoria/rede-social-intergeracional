import React, { useState, useEffect } from 'react';
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
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Atualiza dataNascimento automaticamente
  useEffect(() => {
    if (dia && mes && ano) {
      const data = `${ano}-${mes}-${dia}`;
      setDataNascimento(data); // Atualiza o que vai pro back-end
    }
  }, [dia, mes, ano]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    Swal.fire({
        title: 'Cadastrando...',
        text: 'Aguarde um momento',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Pequeno delay para garantir que o alerta apareça antes da requisição
    setTimeout(async () => {
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
            setTimeout(() => {
                navigate('/login');
            }, 1500);

            } catch (error) {
            Swal.close();
            console.error('Erro ao fazer o cadastro', error);
            setIsSubmitting(false);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Erro desconhecido. Tente novamente.');
            }
        }
    }, 100);
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
                            onChange={(e) => {
                                const valor = e.target.value;
                                const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/; // Permite letras e espaços (inclusive acentos)
                              
                                if (regex.test(valor)) {
                                  setNome(valor);
                                }
                            }}
                            required
                        />
                    </div>
                    <div className="mb-3">
  <label className="form-label">Data de Nascimento</label>
  <div className="d-flex gap-2">
    <select
      className="form-select"
      value={dia}
      onChange={(e) => setDia(e.target.value)}
      required
    >
      <option value="">Dia</option>
      {[...Array(31)].map((_, i) => (
        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
          {i + 1}
        </option>
      ))}
    </select>

    <select
      className="form-select"
      value={mes}
      onChange={(e) => setMes(e.target.value)}
      required
    >
      <option value="">Mês</option>
      {[
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ].map((nome, i) => (
        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
          {nome}
        </option>
      ))}
    </select>

    <select
      className="form-select"
      value={ano}
      onChange={(e) => setAno(e.target.value)}
      required
    >
      <option value="">Ano</option>
      {Array.from({ length: 100 }, (_, i) => {
        const anoAtual = new Date().getFullYear();
        const anoItem = anoAtual - i;
        return <option key={anoItem} value={anoItem}>{anoItem}</option>;
      })}
    </select>
  </div>
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
                        <button type="submit" className="btn btn-entrar w-100 d-flex justify-content-center align-items-center" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Cadastrando...
                                </>
                            ) : (
                                "Cadastrar"
                            )}
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
