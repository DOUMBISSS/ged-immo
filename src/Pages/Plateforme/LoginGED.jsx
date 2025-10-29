import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGedContext } from "../../contexts/GedContext";

export default function LoginGED() {
  const { loginGed, loading } = useGedContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await loginGed(email, password);
    if (data) navigate("/ged/admins");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img
          src="/logo4 copie.jpg"
          alt="Logo GED Immo"
          style={{ width: "80px", marginBottom: "15px" }}
        />
        <h2>🔐 Connexion GED Immo</h2>
        <p>Connectez-vous à votre espace GED centralisé</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>

      <style>{`
        .login-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          // background: linear-gradient(135deg, #2563eb, #1e3a8a);
        }
        .login-card {
          background: white;
          padding: 2rem 3rem;
          border-radius: 12px;
          text-align: center;
          width: 380px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .login-card h2 {
          margin-bottom: 0.5rem;
          color: #1e3a8a;
        }
        .login-card p {
          color: #555;
          margin-bottom: 1.5rem;
        }
        input {
          width: 100%;
          padding: 0.8rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 0.95rem;
        }
        button {
          width: 100%;
          padding: 0.9rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        }
        button:hover {
          background: #1e40af;
        }
      `}</style>
    </div>
  );
}