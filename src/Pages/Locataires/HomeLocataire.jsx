// src/Locataires/HomeLocataire.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useLocataire } from "../../contexts/LocataireContext";

export default function HomeLocataire() {
  const navigate = useNavigate();
  const { loginLocataire } = useLocataire();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ État de chargement

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }

    setLoading(true); // ⏳ Début du chargement

    try {
      const res = await fetch("https://backend-ged-immo.onrender.com/locataire/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      // 🧩 Gestion des erreurs côté serveur
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Compte non trouvé.");
        } else if (res.status === 401) {
          toast.error("Mot de passe incorrect.");
        } else if (res.status === 403) {
          toast.error(
            "Votre compte est désactivé car il a été archivé. Veuillez contacter l’administrateur."
          );
        } else {
          toast.error(data.message || "Erreur lors de la connexion.");
        }
        setLoading(false);
        return;
      }

      // ✅ Enregistrer le locataire et le token
      loginLocataire(data.user, data.token);
      toast.success("Connexion réussie !");
      navigate(`/account/fr/${data.user._id}`, { state: { locataire: data.user } });
    } catch {
      toast.error("Erreur de connexion. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false); // ⏹️ Fin du chargement
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div style={styles.assistHeader}>
        <p>
          <i className="fa-solid fa-phone"></i> Service assistance : +225 07 77 88 00 82
        </p>
        <p>Email : doumbia77fode@gmail.com</p>
      </div>

      <div className="container-locataire">
        <div className="card-locataire">
          <h2>Connexion Locataire</h2>
          <form onSubmit={handleSubmit} className="form-locataire">
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                type="text"
                placeholder="Votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    marginLeft: "0.5rem",
                    padding: "0.3rem 0.5rem",
                    cursor: "pointer",
                    borderRadius: "0.3rem",
                    border: "1px solid #ccc",
                    background: "#f0f0f0",
                  }}
                >
                  {showPassword ? "Cacher" : "Voir"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-locataire"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 🔹 Petit style intégré pour le spinner */}
      <style>{`
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f2f2f7",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  assistHeader: {
    width: "100%",
    backgroundColor: "#fff",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    marginBottom: "30px",
    gap: "10px",
    flexWrap: "wrap",
  },
  link: { textDecoration: "none", color: "#3498db", fontWeight: "bold" },
  helpBtn: {
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    padding: "5px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  loginContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  loginBox: {
    backgroundColor: "#fff",
    padding: "40px 30px",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center",
  },
  logo: { width: "100px", height: "100px", objectFit: "contain", marginBottom: "20px" },
  title: { marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "12px 15px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.3s",
  },
  linksContainer: { marginTop: "15px", fontSize: "0.9rem", color: "#555" },
  resendLink: { color: "#3498db", cursor: "pointer", textDecoration: "underline" },
  forgotLink: {
    color: "#e74c3c",
    cursor: "pointer",
    textDecoration: "underline",
    display: "block",
    marginBottom: "10px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center",
  },
  modalTitle: { fontSize: "1.5rem", marginBottom: "10px", color: "#333" },
  modalSubtitle: { fontSize: "1rem", color: "#666", marginBottom: "20px" },
  closeBtn: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};