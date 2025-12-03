import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const backend = 'https://backend-ged-immo.onrender.com'; // ou votre URL backend

export default function LoginMagasin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backend}/owners/login`, { email, password });
      // Sauvegarde du token si succès
      localStorage.setItem('magasinToken', res.data.token);
      navigate('/home-magasin'); // redirige vers le dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src="/logo4 copie.jpg" alt="GED Immo" className="logo" />
        </div>
        <h2>Connexion Propriétaire</h2>
        <form onSubmit={handleLogin} className="login-form">
          {error && <p className="error-msg">{error}</p>}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Entrez votre email" 
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Entrez votre mot de passe" 
              required
            />
          </div>
          <button type="submit" className="login-btn">Se connecter</button>
        </form>
      </div>

      <style>{`
       .login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f4f6f8;
  font-family: 'Rajdhani', sans-serif;
}

.login-container {
  width: 380px;
  padding: 2rem;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border-radius: 10px;
  text-align: center;
}

.logo-container {
  margin-bottom: 1rem;
}

.logo {
  width: 150px;
  object-fit: contain;
}

h2 {
  margin-bottom: 1.5rem;
  color: #0a3a85;
}

.login-form .form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.login-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.login-form input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: #0a3a85;
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.login-btn:hover {
  background: #001e4d;
}

.error-msg {
  color: red;
  margin-bottom: 1rem;
}
      `}</style>
    </div>
    
  );
       
}