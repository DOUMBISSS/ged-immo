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
  const [subscriptionType, setSubscriptionType] = useState("mensuel");
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
      const res = await fetch("https://backend-ged-immo.onrender.com/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          username,
          address,
          number,
          email,
          password,
          password2,
          subscriptionType, // ✅ Ajouté ici
        }),
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

  const renderInput = (type, placeholder, value, onChange, helpText) => (
    <div style={styles.inputGroup}>
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
            {renderInput("text", "Nom complet", fullname, (e) => setFullname(e.target.value))}
            {renderInput("text", "Nom d'utilisateur", username, (e) => setUsername(e.target.value))}
            {renderInput("text", "Adresse", address, (e) => setAddress(e.target.value))}
            {renderInput("text", "Numéro", number, (e) => setNumber(e.target.value))}
            {renderInput("email", "Email", email, (e) => setEmail(e.target.value))}
            {renderInput("password", "Mot de passe", password, (e) => setPassword(e.target.value))}
            {renderInput("password", "Confirmation mot de passe", password2, (e) => setPassword2(e.target.value))}

            {/* === 🔹 CHOIX DE L’ABONNEMENT === */}
            <div style={styles.selectGroup}>
              <label style={styles.label}>Choisir un abonnement</label>
              <select
                value={subscriptionType}
                onChange={(e) => setSubscriptionType(e.target.value)}
                style={styles.select}
              >
                <option value="mensuel">Mensuel — 10 000 FCFA / mois</option>
                <option value="annuel">Annuel — 100 000 FCFA / an</option>
                <option value="premium">Premium — 180 000 FCFA / 2 ans</option>
              </select>
            </div>

            {/* Info dynamique */}
            <p style={styles.subscriptionInfo}>
              {subscriptionType === "mensuel" && "📅 Votre abonnement durera 1 mois."}
              {subscriptionType === "annuel" && "📅 Votre abonnement durera 1 an."}
              {subscriptionType === "premium" && "💎 Votre abonnement premium durera 2 ans."}
            </p>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Création en cours..." : "S'inscrire"}
            </button>
          </form>

          <p style={styles.loginLink}>
            Déjà un compte ? <Link to="/" style={styles.link}>Connexion</Link>
          </p>
        </div>
      </div>

      {/* === MODAL D’AIDE === */}
      {showHelp && (
        <div style={styles.modalOverlay} onClick={() => setShowHelp(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Comment créer votre compte</h2>
            <ol style={styles.stepsContainer}>
              <li style={styles.step}><span style={styles.stepIcon}>📝</span> Remplissez le formulaire avec un email valide.</li>
              <li style={styles.step}><span style={styles.stepIcon}>📧</span> Vérifiez votre boîte mail pour confirmer.</li>
              <li style={styles.step}><span style={styles.stepIcon}>💳</span> Choisissez un abonnement pour activer votre compte.</li>
              <li style={styles.step}><span style={styles.stepIcon}>✅</span> Une fois validé, connectez-vous à votre espace GED.</li>
            </ol>
            <button style={styles.closeBtn} onClick={() => setShowHelp(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// === Styles ===
const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f2f2f7", minHeight: "110vh" },
  formContainer: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%" },
  box: { backgroundColor: "#fff", padding: "40px 30px", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%", textAlign: "center" },
  logo: { width: "80px", height: "80px", objectFit: "contain", marginBottom: "15px" },
  title: { marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { position: "relative" },
  inputWithIcon: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem", width: "100%" },
  selectGroup: { display: "flex", flexDirection: "column", textAlign: "left" },
  label: { marginBottom: "5px", fontWeight: "600", color: "#333" },
  select: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" },
  subscriptionInfo: { fontSize: "0.9rem", color: "#555", fontStyle: "italic" },
  button: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3498db", color: "#fff", fontSize: "1rem", cursor: "pointer" },
  loginLink: { marginTop: "15px", fontSize: "0.9rem", color: "#555" },
  link: { textDecoration: "none", color: "#3498db", fontWeight: "bold" },
  assistHeader: { backgroundColor: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginBottom: "30px", flexWrap: "wrap" },
  helpBtn: { padding: "5px 10px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", border: "none", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 },
  modalContent: { backgroundColor: "#fff", padding: "30px", borderRadius: "15px", maxWidth: "500px", width: "90%" },
  modalTitle: { marginBottom: "15px", fontSize: "1.5rem", color: "#333" },
  stepsContainer: { display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0 },
  step: { background: "#f9f9fb", padding: "10px 15px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" },
  stepIcon: { fontSize: "1.5rem" },
  closeBtn: { marginTop: "15px", padding: "10px 15px", borderRadius: "8px", border: "none", backgroundColor: "#3498db", color: "#fff", cursor: "pointer" },
};