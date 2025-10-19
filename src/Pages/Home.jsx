import { useUserContext } from "../contexts/UserContext";
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export default function Home() {
  const { login } = useUserContext();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { token: activationToken } = useParams(); 
  const [showHelp, setShowHelp] = useState(false);

  // 🔹 Pour reset password directement sur la page
  const [showForgotEmail, setShowForgotEmail] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // --- Activation compte ---
    if (activationToken) {
      fetch(`http://localhost:4000/confirm/${activationToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert("Compte activé avec succès !");
            navigate("/");
          } else {
            alert(data.message || "Erreur lors de l'activation");
          }
        })
        .catch(err => console.error(err));
    }

    // --- Reset password via query token ---
    const params = new URLSearchParams(location.search);
    const tokenFromQuery = params.get("token");
    if (tokenFromQuery) {
      setResetToken(tokenFromQuery);
      setShowResetPassword(true);
    }
  }, [activationToken, location, navigate]);

  // --- LOGIN (Admin ou User/Manager) ---
const loginHandler = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Choix de l'endpoint selon le rôle
    const endpoint =
      role === "admin"
        ? "http://localhost:4000/admin/login"
        : "http://localhost:4000/user/login";

    // Préparer le corps de la requête
    const body =
      role === "admin"
        ? { email: emailOrUsername.trim(), password: password.trim(), role }
        : { username: emailOrUsername.trim(), password: password.trim(), role };

    // Requête login
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Gestion des erreurs
    if (!response.ok) {
      toast.error(data.message || "Identifiants incorrects");
      return;
    }

    if (!data.user || !data.token) {
      toast.error("Impossible de récupérer les informations de l'utilisateur");
      return;
    }

    // 🔹 Préparer le user object pour le UserContext
    const userData = {
      ...data.user,
      token: data.token,
      isAdmin: role === "admin",                // ✅ savoir si c'est admin
      adminId: role === "admin" ? data.user._id : data.user.adminId || null, // ✅ ID admin
      userId: role !== "admin" ? data.user._id : null,                        // ✅ ID user
    };

    // Enregistrement dans le UserContext
    login(userData);

    // Message de bienvenue
    toast.success(`Bienvenue, ${data.user.fullname || "Utilisateur"} 👋`);

    // Redirection conditionnelle selon rôle
    navigate(role === "admin" ? "/users" : "/users"); // tu peux adapter les routes si besoin

  } catch (error) {
    console.error("Erreur serveur :", error);
    toast.error("Erreur serveur, réessayez plus tard");
  } finally {
    setLoading(false);
  }
};

  // --- Renvoyer lien activation ---
  const resendLink = async () => {
    if (!emailOrUsername) return toast.error("Veuillez entrer votre email");
    setResendLoading(true);
    try {
      const res = await fetch("http://localhost:4000/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrUsername }),
      });
      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.message);
    } catch (err) {
      toast.error("Erreur serveur, réessayez plus tard");
    } finally {
      setResendLoading(false);
    }
  };

  // --- Mot de passe oublié ---
  const handleForgotPassword = async () => {
    if (!forgotEmail) return toast.error("Veuillez entrer votre email");

    try {
      const res = await fetch("http://localhost:4000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Lien envoyé ! Vérifiez votre email.");
        setShowForgotEmail(false);
        setForgotEmail("");
      } else {
        toast.error(data.message || "Erreur lors de l'envoi du lien");
      }
    } catch (err) {
      toast.error("Erreur serveur, réessayez plus tard");
      console.error(err);
    }
  };

  // --- Réinitialisation mot de passe ---
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return toast.error("Tous les champs sont obligatoires");
    if (newPassword !== confirmPassword)
      return toast.error("Les mots de passe ne correspondent pas");

    try {
      const res = await fetch(`http://localhost:4000/reset-password/${resetToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Mot de passe réinitialisé !");
        setShowResetPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setResetToken(null);
        navigate("/");
      } else {
        toast.error(data.message || "Erreur lors de la réinitialisation");
      }
    } catch (err) {
      toast.error("Erreur serveur, réessayez plus tard");
      console.error(err);
    }
  };

  return (
    <div style={styles.page}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Aide et info */}
      <div style={styles.assistHeader}>
        <p><i className="fa-solid fa-phone"></i> Service assistance : +225 07 77 88 00 82</p>
        <p>Email : doumbia77fode@gmail.com</p>
        <Link to="/new__inscription" style={styles.link}>Inscription</Link>
        <button style={styles.helpBtn} onClick={() => setShowHelp(true)}>Aides</button>
      </div>

      {/* Login Box */}
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <img src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`} alt="logo" style={styles.logo} />
          <h2 style={styles.title}>GED IMMO</h2>

          {!showResetPassword && !showForgotEmail && (
            <form onSubmit={loginHandler} style={styles.form}>
              {/* 🟢 Sélecteur de rôle */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.input}
              >
                <option value="admin">👑 Administrateur</option>
                <option value="manager">🧑‍💼 Manager</option>
                <option value="user">👤 Utilisateur</option>
              </select>

              {/* 🟢 Champ dynamique (email pour admin, username pour autres) */}
              <input
                type={role === "admin" ? "email" : "text"}
                placeholder={role === "admin" ? "Email" : "Nom d'utilisateur"}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "Connexion..." : "Connexion"}
              </button>
            </form>
          )}

          {!showResetPassword && (
            <div style={styles.linksContainer}>
              <span onClick={() => setShowForgotEmail(true)} style={styles.forgotLink}>
                Mot de passe oublié ?
              </span>
              {role === "admin" && (
                <p>
                  Pas reçu le mail ?{" "}
                  <span onClick={resendLink} style={styles.resendLink}>
                    {resendLoading ? "Envoi..." : "Renvoyer le lien"}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Reset / Forgot password UI identique */}
          {showForgotEmail && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "10px" }}>📧 Réinitialiser le mot de passe</h3>
              <input
                type="email"
                placeholder="Entrez votre email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={styles.input}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button style={styles.button} onClick={handleForgotPassword}>
                  Envoyer le lien
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: "#e74c3c" }}
                  onClick={() => setShowForgotEmail(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {showResetPassword && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "10px" }}>🔑 Réinitialiser votre mot de passe</h3>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Confirmer mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button style={styles.button} onClick={handleResetPassword}>
                  Réinitialiser
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: "#e74c3c" }}
                  onClick={() => setShowResetPassword(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div>
            <p style={styles.loginLink}>
              Créer un nouveau compte ?{" "}
              <Link to="/new__inscription" style={styles.link}>
                Inscription
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal Aide */}
      {showHelp && (
        <div style={styles.modalOverlay} onClick={() => setShowHelp(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>💡 Aide & FAQ</h2>
            <p style={styles.modalSubtitle}>
              Suivez ces étapes pour configurer et utiliser votre compte GED IMMO.
            </p>
            <button style={styles.closeBtn} onClick={() => setShowHelp(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
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
  button: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3498db", color: "#fff", fontSize: "1rem", cursor: "pointer", transition: "0.3s" },
  linksContainer: { marginTop: "15px", fontSize: "0.9rem", color: "#555" },
  resendLink: { color: "#3498db", cursor: "pointer", textDecoration: "underline" },
  forgotLink: { color: "#e74c3c", cursor: "pointer", textDecoration: "underline", display: "block", marginBottom: "10px" },
  modalOverlay: { position: "fixed", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex: 1000 },
  modalContent: { backgroundColor:"#fff", padding:"30px", borderRadius:"15px", width:"90%", maxWidth:"400px", textAlign:"center" },
  modalTitle: { fontSize:"1.5rem", marginBottom:"10px", color:"#333" },
  modalSubtitle: { fontSize:"1rem", color:"#666", marginBottom:"20px" },
  closeBtn: { backgroundColor:"#e74c3c", color:"#fff", padding:"10px 20px", borderRadius:"8px", border:"none", cursor:"pointer" },
};