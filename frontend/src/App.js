import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; 
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login"; 
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import Conexoes from './pages/Conexoes';
import Conversations from './pages/Conversations';
import Chat from './pages/Chat';
import Groups from './pages/Grupos';
import Group from './pages/GrupoDetalhado';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/perfil/:id" element={<Profile />} />
        <Route path="/conexoes" element={<PrivateRoute><Conexoes /></PrivateRoute>} />
        <Route path="/conversas" element={<PrivateRoute><Conversations /></PrivateRoute>} />
        <Route path="/chat/:friendId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/grupos" element={<PrivateRoute><Groups /></PrivateRoute>} />
        <Route path="/grupo/:groupId" element={<PrivateRoute><Group /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default App;