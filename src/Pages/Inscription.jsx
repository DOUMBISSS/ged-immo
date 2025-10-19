import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";


export default function Inscription() {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const isValidNumber = (num) => /^\d{8,15}$/.test(num);

   const RegisterHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!fullname || !username || !address || !number || !email || !password || !password2) {
      toast.error("Tous les champs sont obligatoires.");
      setLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Email invalide.");
      setLoading(false);
      return;
    }
    if (!isValidNumber(number)) {
      toast.error("Numéro invalide (8 à 15 chiffres).");
      setLoading(false);
      return;
    }
    if (password !== password2) {
      toast.error("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, username, address, number, email, password, password2 }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte ✅");
        setTimeout(() => navigate("/"), 3000);
      } else {
        toast.error(data.message || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      console.error("Erreur serveur :", err);
      toast.error("Erreur serveur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon, type, placeholder, value, onChange, helpText) => (
    <div style={styles.inputGroup}>
      <span style={styles.icon}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={styles.inputWithIcon}
        required
      />
      {helpText && (
        <span style={styles.helpIcon} title={helpText}>
          ?
        </span>
      )}
    </div>
  );

  return (
    <div style={styles.page}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* --- HEADER / AIDE ET INFO --- */}
      <div style={styles.assistHeader}>
        <p><i className="fa-solid fa-phone"></i> Service assistance : +225 07 77 88 00 82</p>
        <p>Email : doumbia77fode@gmail.com</p>
        <Link to="/" style={styles.link}>Connexion</Link>
        <button style={styles.helpBtn} onClick={() => setShowHelp(true)}>Aides</button>
      </div>

      {/* --- FORMULAIRE D'INSCRIPTION --- */}
      <div style={styles.formContainer}>
        <div style={styles.box}>
          <img src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`} alt="logo" style={styles.logo} />
          <h2 style={styles.title}>Créer un compte</h2>

          <form onSubmit={RegisterHandler} style={styles.form}>
            {renderInput("text", "Nom complet", fullname, e => setFullname(e.target.value), "Entrez votre nom et prénom")}
            {renderInput("text", "@username", username, e => setUsername(e.target.value), "Choisissez un nom d'utilisateur unique")}
            {renderInput( "text", "Adresse", address, e => setAddress(e.target.value))}
            {renderInput( "text", "Numéro", number, e => setNumber(e.target.value), "Numéro de téléphone (8 à 15 chiffres)")}
            {renderInput( "email", "Email", email, e => setEmail(e.target.value), "Adresse email valide")}
            {renderInput("password", "Mot de passe", password, e => setPassword(e.target.value), "Minimum 8 caractères")}
            {renderInput("password", "Confirmation mot de passe", password2, e => setPassword2(e.target.value), "Retapez le mot de passe")}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Création en cours..." : "S'inscrire"}
            </button>
          </form>

          <p style={styles.loginLink}>
            Déjà un compte ? <Link to="/" style={styles.link}>Connexion</Link>
          </p>
        </div>
      </div>
{showHelp && (
  <div style={styles.modalOverlay} onClick={() => setShowHelp(false)}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>Comment créer votre compte</h2>
      <p style={styles.modalSubtitle}>Suivez ces étapes :</p>
      <ol style={styles.stepsContainer}>
        <li style={styles.step}>
          <span style={styles.stepIcon}>📝</span>
          <span style={styles.stepContent}>Remplissez le formulaire avec un email existant.</span>
        </li>
        <li style={styles.step}>
          <span style={styles.stepIcon}>📧</span>
          <span style={styles.stepContent}>Vous recevrez un lien dans votre boîte mail (ou spam) pour confirmer le compte.</span>
        </li>
        <li style={styles.step}>
          <span style={styles.stepIcon}>✅</span>
          <span style={styles.stepContent}>Cliquez sur le lien pour activer votre compte et pouvoir vous connecter.</span>
        </li>
        <li style={styles.step}>
          <span style={styles.stepIcon}>⏳</span>
          <span style={styles.stepContent}>L'activation est instantanée, mais parfois un délai peut survenir selon votre boîte mail.</span>
        </li>
        <li style={styles.step}>
          <span style={styles.stepIcon}>🔑</span>
          <span style={styles.stepContent}>Une fois activé, utilisez votre email et mot de passe pour vous connecter.</span>
        </li>
        <li style={styles.step}>
          <span style={styles.stepIcon}>🔒</span>
          <span style={styles.stepContent}>Votre compte est sécurisé et vos informations confidentielles.</span>
        </li>
      </ol>
      <button style={styles.closeBtn} onClick={() => setShowHelp(false)}>Fermer</button>
    </div>
  </div>
)}
    </div>
  );
}
// --- Styles ---
const styles = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f2f2f7",
    minHeight: "110vh",
    display: "block",
    justifyContent: "center",
    alignItems: "center",
    // padding: "2rem",
  },
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  box: {
    backgroundColor: "#fff",
    padding: "40px 30px",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
  },
  logo: { width: "80px", height: "80px", objectFit: "contain", marginBottom: "15px" },
  title: { marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { position: "relative", display: "flex", alignItems: "center" },
  icon: { position: "absolute", left: "10px", color: "#888" },
  helpIcon: { position: "absolute", right: "10px", cursor: "help", fontWeight: "bold", color: "#3498db" },
  inputWithIcon: { padding: "12px 15px 12px 35px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem", width: "100%" },
  button: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3498db", color: "#fff", fontSize: "1rem", cursor: "pointer", transition: "0.3s" },
  loginLink: { marginTop: "15px", fontSize: "0.9rem", color: "#555" },
   link: { textDecoration: "none", color: "#3498db", fontWeight: "bold" },

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
  helpBtn: {
    padding: '5px 10px',
    borderRadius: '5px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  },
    modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    position: "relative",
  },
  modalTitle: { marginBottom: "10px", fontSize: "1.5rem" },
  modalSubtitle: { marginBottom: "20px", color: "#555" },
  stepsContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  step: { display: "flex", alignItems: "flex-start", gap: "10px" },
  stepIcon: { fontSize: "1.5rem" },
  stepContent: { fontSize: "0.95rem", color: "#333" },
  closeBtn: {
    marginTop: "20px",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    cursor: "pointer",
  },
  stepsContainer: {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  padding: 0,
  listStyle: 'none',
},

step: {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '15px',
  background: '#f9f9fb',
  padding: '10px 15px',
  borderRadius: '10px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  transition: 'all 0.2s ease',
},


stepIcon: {
  fontSize: '1.8rem',
  flexShrink: 0,
},

stepContent: {
  fontSize: '1rem',
  color: '#333',
  lineHeight: 1.4,
}
};