import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Sidebar from '../Components/Sidebar';
import Footer from './Footer';
import { useUserContext } from '../contexts/UserContext'; // <-- ton contexte utilisateur

export default function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useUserContext(); // récupère l'admin connecté
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Veuillez saisir un nom de projet");
    }

    try {
      const res = await fetch('http://localhost:4000/NewProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description, 
          AdminId: user._id // <-- inclut l'admin connecté
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Projet "${data.name}" créé !`);
        setName('');
        setDescription('');
        navigate('/Mes__projet/fr/'); // Retour à la liste des projets
      } else {
        toast.error(data.message || "Erreur lors de la création du projet");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création du projet");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <div className="containers">
        <div className="dashboard">
        
          <div className="right--panel">
            <div className="new-project-header">
              <h1>Nouveau projet</h1>
              <Link to="/Mes__projet/fr/" className="btn-back">
                <i className="fa-solid fa-arrow-left"></i> Retour aux projets
              </Link>
            </div>

            <form className="new-project-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom du projet</label>
                <input
                  type="text"
                  placeholder="Nom du projet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optionnelle)</label>
                <textarea
                  placeholder="Description du projet"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-confirm">
                Créer le projet
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .new-project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .btn-back {
          background: #bdc3c7;
          padding: 6px 12px;
          border-radius: 6px;
          color: black;
          text-decoration: none;
        }
        .btn-back:hover { background: #95a5a6; color: white; }

        .new-project-form {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          max-width: 500px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .form-group {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 5px;
        }

        .form-group input,
        .form-group textarea {
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
        }

        .btn-confirm {
          background: #4CAF50;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .btn-confirm:hover {
          background: #45a049;
        }
      `}</style>
    </>
  );
}