# 🌐 ConectaVidas — Rede Social Intergeracional


![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Deploy-Render-1E1E1E?style=flat)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat&logo=postman&logoColor=white)


---


✨ **ConectaVidas** é uma aplicação que conecta gerações, permitindo a troca de experiências entre jovens e idosos, criando um ambiente acolhedor, intuitivo e acessível.


🌐 **Acesse o projeto hospedado no Render:**
[https://conectavidas.onrender.com/](https://conectavidas.onrender.com/)


---


## 🎯 Funcionalidades Principais
- 👥 **Autenticação:** login e cadastro
- 💬 **Chat em tempo real**
- 📝 **Postagens:** textos e imagens
- ❤️ **Curtidas e comentários**
- 🧵 **Respostas encadeadas** em comentários
- 📸 **Upload de imagens** via Cloudinary
- 👪 **Grupos:** criar, participar e sair
- 🕓 **Feed dinâmico** com rolagem e atualização automática
- 🧩 **Interface responsiva** para desktop e mobile


---


## 🖼️ Screenshots  
<p align="center">
  Tela inicial  
</p>
<p align="center">
  <img width="700" alt="tela" src="https://github.com/user-attachments/assets/485dd91b-0f8c-427d-8e78-f0a56c47e573" />  
</p>

<p align="center">
  Interface do usuário 
</p>
<p align="center">
  <img width="700" alt="interface" src="https://github.com/user-attachments/assets/cd0be9ca-a854-467b-acce-1df6d110d943" />
</p>

<p align="center">
  Perfil do usuário
</p>
<p align="center">
  <img width="700" height="802" alt="unnamed" src="https://github.com/user-attachments/assets/d8857137-9147-4e2c-b6ba-cb10db4173f4" />

</p>

<p align="center">
  Histórico de conversa
</p>
<p align="center">
  <img width="700" height="715" alt="unnamed" src="https://github.com/user-attachments/assets/c07ab2d5-fd51-4e06-9cfd-3c6b6ffbe396" />
</p>

<p align="center">
  Chat individual
</p>
<p align="center">
  <img width="700" height="720" alt="unnamed" src="https://github.com/user-attachments/assets/1db212d3-d723-4d0d-b7cd-7b7caa1f27eb" />
</p>


---


## 🗂 Estrutura do Projeto
```
frontend/ # Aplicação React
backend/ # API Node.js / Express
README.md
LICENSE
```


---


## ⚙️ Tecnologias Utilizadas

### 🖥️ Frontend
- React.js
- Axios
- Bootstrap / CSS puro
- Cloudinary (upload de imagens)
- Socket.IO Client (chat em tempo real)

### ⚙️ Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (autenticação)
- Socket.IO Server (chat)
- dotenv (variáveis de ambiente)
- Render (deploy)

---


## ⚙️ Como Executar Localmente


### 1️⃣ Clone o repositório
```bash
git clone https://github.com/biavitoria/rede-social-intergeracional.git
```


### 2️⃣ Acesse a pasta principal
```bash
cd rede-social-intergerencial
```


### 3️⃣ Configure o backend
```bash
cd backend
npm install
```


Crie um arquivo `.env`:
```
PORT=5000
MONGO_URI=sua_string_de_conexao
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
JWT_SECRET=sua_chave_secreta
```


Inicie o servidor:
```bash
npm start
```


### 4️⃣ Configure o frontend
```bash
cd ../frontend
npm install
npm start
```


A aplicação estará disponível em **http://localhost:3000**


---


## 🎨 Design e Experiência
- Interface simples e intuitiva
- Foco em **acessibilidade e legibilidade**
- Cores suaves e tipografia clara
- Responsividade para desktop e mobile


---


## 📄 Pesquisa e TCC
O projeto também está respaldado por pesquisa acadêmica e TCC.  
Você pode acessar o documento do TCC aqui: [Download TCC](https://drive.google.com/file/d/1eb_cxwulfunqjG1O-86nnWqXbhK1v8CW/view?usp=drive_link)  
Além disso, diagramas e fluxogramas detalham a arquitetura do sistema.


---


## 📝 Documentação da API
A API está documentada no **Postman**: endpoints de usuários, posts, comentários e grupos.  
Acesse a documentação aqui: [Link do Postman](https://documenter.getpostman.com/view/43028276/2sB3Wjz4Ca)]


---


## 💡 Melhorias Futuras
- 🔔 Notificações em tempo real
- ♿ Acessibilidade avançada (modo alto contraste, leitor de tela)
- 🌎 Tradução multilíngue

---


## 👩‍💻 Autora
**Beatriz Vitória Brandão Silva**  
📧 beatrizvsbrandao@gmail.com  
💼 [LinkedIn](https://www.linkedin.com/in/beatrizvsbrandao)
