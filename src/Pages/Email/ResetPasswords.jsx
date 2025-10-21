import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswords() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Validation du mot de passe ---
  const validatePassword = (pwd) => {
    if (pwd.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (!/[A-Z]/.test(pwd)) {
      toast.error("Le mot de passe doit contenir au moins une majuscule");
      return false;
    }
    if (!/[0-9]/.test(pwd)) {
      toast.error("Le mot de passe doit contenir au moins un chiffre");
      return false;
    }
    return true;
  };

  // --- Réinitialisation du mot de passe ---
  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!validatePassword(newPassword)) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Mot de passe réinitialisé avec succès ✅", {
          duration: 3000,
          icon: "🔒",
          style: {
            background: "#2ecc71",
            color: "#fff",
            fontWeight: "bold",
          },
        });

        // ✅ Message de redirection
        toast("Redirection vers l’accueil...", {
          duration: 2000,
          icon: "➡️",
          style: { background: "#3498db", color: "#fff" },
        });

        // ✅ Redirection après 3 secondes
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        toast.error(data.message || "Erreur lors de la réinitialisation", {
          duration: 3000,
          icon: "❌",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur, réessayez plus tard", { icon: "⚠️" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <Toaster position="top-right" />

     

        <div style={cardStyle}>
           <div style={styles.loginBox}>
        <img
          src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`}
          alt="logo"
          style={styles.logo}
        />
        <h2 style={styles.title}>GED IMMO</h2>
          <h2 style={titleStyle}>🔑 Réinitialisation du mot de passe</h2>

          <div style={inputContainer}>
            <div style={passwordFieldStyle}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={eyeIconStyle}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <input
              type="password"
              placeholder="Confirmer mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Rajdhani', sans-serif",
  padding: "20px",
  // background: "linear-gradient(135deg, #f0f4ff, #cce0ff)",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "40px 30px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  width: "420px",
  maxWidth: "100%",
  textAlign: "center",
  transition: "all 0.3s ease",
};

const titleStyle = {
  marginBottom: "30px",
  color: "#2c3e50",
  fontWeight: "bold",
  fontSize: "1.6rem",
};

const inputContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  marginBottom: "25px",
};

const passwordFieldStyle = {
  position: "relative",
};

const eyeIconStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  color: "#3498db",
  fontSize: "1.1rem",
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  fontSize: "16px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  outline: "none",
  transition: "all 0.3s ease",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#3498db",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const styles = {
  loginBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "20px",
  },
};