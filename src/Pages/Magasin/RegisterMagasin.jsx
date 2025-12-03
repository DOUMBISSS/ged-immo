import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backend = "https://backend-ged-immo.onrender.com"; // 🧩 Ton URL backend

export default function RegisterMagasin() {
  const navigate = useNavigate();

  // 🔹 États du formulaire
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Gestion des changements
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔹 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.email || !formData.phone || !formData.password) {
      toast.error("Tous les champs obligatoires doivent être remplis !");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${backend}/owners/register`, {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });

      if (res.data.success) {
        toast.success("Compte propriétaire créé avec succès !");
        setTimeout(() => navigate("/login-magasin"), 2000);
      } else {
        toast.error(res.data.message || "Erreur lors de la création du compte.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur serveur !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src="/logo4 copie.jpg" alt="GED Immo" className="logo" />
        </div>

        <h2>Créer un compte propriétaire</h2>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Nom complet */}
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Entrez le nom complet"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre email"
              required
            />
          </div>

          {/* Téléphone */}
          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Entrez votre téléphone"
              required
            />
          </div>

          {/* Adresse */}
          <div className="form-group">
            <label>Adresse</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Entrez votre adresse"
            />
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          {/* Confirmation mot de passe */}
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmez votre mot de passe"
              required
            />
          </div>

          {/* Bouton */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Création en cours..." : "Créer le compte"}
          </button>

          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Déjà un compte ?{" "}
            <span
              style={{ color: "#0a3a85", cursor: "pointer", fontWeight: "bold" }}
              onClick={() => navigate("/loginPage")}
            >
              Se connecter
            </span>
          </p>
        </form>
      </div>

      {/* Styles */}
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
      `}</style>
    </div>
  );
}