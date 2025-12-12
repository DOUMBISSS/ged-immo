import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { toast, Toaster } from "react-hot-toast";
import SubscriptionModal from "./SubscriptionModal";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token: activationToken } = useParams();
  const { login ,getAuthHeaders} = useUserContext();

  // === Mode affiché : login ou register ===
  const [mode, setMode] = useState("login");

  // === États communs ===
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // === Login states ===
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  // === Register states ===
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [password2, setPassword2] = useState("");
  // === Type d'administrateur ===
const [typeAdmin, setTypeAdmin] = useState("particulier");

// === Champs société ===
const [companyName, setCompanyName] = useState("");
const [identificationNumber, setIdentificationNumber] = useState("");
const [legalMention, setLegalMention] = useState("Cachet électronique généré automatiquement");
const [logo, setLogo] = useState(null);
const [logoPreview, setLogoPreview] = useState(null);
const [subscriptionType, setSubscriptionType] = useState("gratuit");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // === Reset password ===
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  // === États pour la réinitialisation et renvoi d’email ===
const [resendLoading, setResendLoading] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [showForgotEmail, setShowForgotEmail] = useState(false);
const [sending, setSending] = useState(false); 

  // === Activation & Reset token depuis URL ===
  useEffect(() => {
    if (activationToken) {
      fetch(`http://localhost:4000/confirm/${activationToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast.success("✅ Compte activé avec succès !");
            navigate("/");
          } else {
            toast.error(data.message || "Erreur d’activation");
          }
        })
        .catch(console.error);
    }

    const params = new URLSearchParams(location.search);
    const tokenFromQuery = params.get("token");
    if (tokenFromQuery) {
      setResetToken(tokenFromQuery);
      setShowResetPassword(true);
    }
  }, [activationToken, location, navigate]);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const endpoint =
      role === "admin" || role === "manager"
        ? "http://localhost:4000/admin/login"
        : "http://localhost:4000/user/login";

    const body =
      role === "admin" || role === "manager"
        ? { email: emailOrUsername.trim(), password: password.trim() }
        : { username: emailOrUsername.trim(), password: password.trim() };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("✅ DATA BACKEND LOGIN :", data);

    if (!response.ok) {
      toast.error(data.message || "Identifiants incorrects");
      return;
    }

    // 🔹 Vérifie si user existe dans la réponse
    if (!data.user || !data.token || !data.user.sessionToken) {
      toast.error("Impossible de récupérer les informations utilisateur");
      return;
    }

    const userData = {
      ...data.user,
      isAdmin: role === "admin" || role === "manager",
      adminId: role === "admin" || role === "manager" ? data.user._id : data.user.adminId || null,
      userId: role !== "admin" && role !== "manager" ? data.user._id : null,
      role: role,
    };

    login(userData, data.token, data.user.sessionToken);

    toast.success(`Bienvenue, ${data.user.fullname || "Utilisateur"} 👋`);

    if (role === "admin") navigate("/Accueil");
    else if (role === "user") navigate("/Accueil");
    else navigate("/");

  } catch (err) {
    console.error("Erreur handleLogin :", err);
    toast.error("Erreur serveur, réessayez plus tard");
  } finally {
    setLoading(false);
  }
};
  // === REGISTER ===
const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (password !== password2) {
    toast.error("Les mots de passe ne correspondent pas");
    setLoading(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("typeAdmin", typeAdmin);
    formData.append("fullname", fullname);
    formData.append("username", username);
    formData.append("address", address);
    formData.append("number", number);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password2", password2); // ✅ Important
    formData.append("subscriptionType", subscriptionType);

    if (typeAdmin === "societe") {
      formData.append("companyName", companyName);
      formData.append("identificationNumber", identificationNumber);
      formData.append("legalMention", legalMention);
      if (logo) formData.append("logo", logo);
    } else {
      // Si particulier, le logo est optionnel
      if (logo) formData.append("logo", logo);
    }

    const res = await fetch("http://localhost:4000/admin/register", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Inscription réussie ! Vérifiez votre email ✅");
      setTimeout(() => setMode("login"), 10000);
    } else {
      toast.error(data.message || "Erreur lors de l'inscription");
    }
  } catch (err) {
    console.error(err);
    toast.error("Erreur serveur : " + err.message);
  } finally {
    setLoading(false);
  }
};

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

    // ✅ Toujours afficher le message reçu du backend
    toast.success(data.message);
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
      const res = await fetch("https://backend-ged-immo.onrender.com/forgot-password", {
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
      const res = await fetch(`https://backend-ged-immo.onrender.com/reset-password/${resetToken}`, {
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

  const uploadBoxStyle = {
  border: "2px dashed #cbd5e1",
  borderRadius: "12px",
  padding: "15px",
  backgroundColor: "#ffffff",
  textAlign: "center",
  transition: "all 0.25s ease",
  cursor: "pointer",
};

const LogoPreview = ({ logoPreview, onRemove }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
    }}
  >
    <img
      src={logoPreview}
      alt="Logo aperçu"
      style={{
        width: "80px",
        height: "80px",
        objectFit: "contain",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    />
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      style={{
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        border: "none",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "0.8rem",
        cursor: "pointer",
      }}
    >
      Retirer
    </button>
  </div>
);
  return (
    <div style={styles.page}>
      <Toaster position="top-right" />
      <div style={styles.assistHeader}>
        <p><i className="fa-solid fa-phone"></i> Assistance : +225 07 77 88 00 82</p>
        <p>Email : doumbia77fode@gmail.com</p>
        <button style={styles.helpBtn} onClick={() => setShowHelp(true)}>Aide</button>
      </div>

      <div style={styles.authBox}>
        <img src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`} alt="logo" style={styles.logo} />
        <h2 style={styles.title}>GED IMMO</h2>

        {/* === Toggle Login/Register === */}
        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tabBtn, backgroundColor: mode === "login" ? "#3498db" : "#ccc" }}
            onClick={() => setMode("login")}
          >
            Connexion
          </button>
          <button
            style={{ ...styles.tabBtn, backgroundColor: mode === "register" ? "#3498db" : "#ccc" }}
            onClick={() => setMode("register")}
          >
            Inscription
          </button>
        </div>

       {/* === LOGIN FORM === */}
{mode === "login" && !showResetPassword && (
  <form onSubmit={handleLogin} style={styles.form}>
    <select 
      value={role} 
      onChange={(e) => setRole(e.target.value)} 
      style={styles.input}
    >
      <option value="admin">👑 Administrateur</option>
      <option value="manager">🧑‍💼 Manager</option>
      <option value="user">👤 Utilisateur</option>
    </select>

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

    {/* === Liens mot de passe oublié et renvoi email === */}
    <div style={styles.linksContainer}>
      <span 
        onClick={() => setShowForgotEmail(true)} 
        style={styles.forgotLink}
      >
        🔑 Mot de passe oublié ?
      </span>

      {role === "admin" && (
        <p style={styles.resendText}>
          Pas reçu le mail ?{" "}
          <span 
            onClick={resendLink} 
            style={styles.resendLink}
          >
            {resendLoading ? "⏳ Envoi..." : "📨 Renvoyer le lien"}
          </span>
        </p>
      )}
    </div>

    <button type="submit" style={styles.button}>
      {loading ? "Connexion..." : "Connexion"}
    </button>
  </form>
)}

{showForgotEmail && (
  <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
    <h3 style={{ marginBottom: "10px" }}>📧 Réinitialiser le mot de passe</h3>
    <input
      type="email"
      placeholder="Entrez votre email"
      value={forgotEmail}
      onChange={(e) => setForgotEmail(e.target.value)}
      style={styles.input}
      required
    />
    <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
      <button
        style={{ 
          ...styles.button,
          opacity: sending ? 0.7 : 1,
          cursor: sending ? "not-allowed" : "pointer",
        }}
        onClick={async () => {
          if (!forgotEmail) return toast.error("Veuillez entrer votre email");
          setSending(true);
          try {
            await handleForgotPassword(); // appeler ta fonction existante
          } finally {
            setSending(false);
          }
        }}
        disabled={sending}
      >
        {sending ? "⏳ Envoi en cours..." : "Envoyer le lien"}
      </button>

      <button
        style={{ ...styles.button, backgroundColor: "#e74c3c" }}
        onClick={() => setShowForgotEmail(false)}
        disabled={sending} // empêche annulation pendant l'envoi
      >
        Annuler
      </button>
    </div>
  </div>
)}

{mode === "register" && (
  <form onSubmit={handleRegister} style={styles.form}>
    {/* 🔹 Type d’administrateur */}
    <label style={{ fontWeight: "bold", textAlign: "left" }}>Type de compte</label>
    <select
      style={styles.input}
      value={typeAdmin}
      onChange={(e) => setTypeAdmin(e.target.value)}
    >
      <option value="particulier">👤 Particulier</option>
      <option value="societe">🏢 Société</option>
    </select>

    {/* 🔹 Champs communs */}
    <input
      style={styles.input}
      placeholder="Nom complet"
      value={fullname}
      onChange={(e) => setFullname(e.target.value)}
      required
    />
    <input
      style={styles.input}
      placeholder="Nom d'utilisateur"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
    />
    <input
      style={styles.input}
      placeholder="Adresse"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      required
    />
    <input
      style={styles.input}
      placeholder="Numéro de téléphone"
      value={number}
      onChange={(e) => setNumber(e.target.value)}
      required
    />
    <input
      style={styles.input}
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      style={styles.input}
      type="password"
      placeholder="Mot de passe"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <input
      style={styles.input}
      type="password"
      placeholder="Confirmer mot de passe"
      value={password2}
      onChange={(e) => setPassword2(e.target.value)}
      required
    />

    {/* 🔹 Bloc Société */}
    {typeAdmin === "societe" && (
      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#f9fafb",
          borderRadius: "14px",
          padding: "20px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h4
          style={{
            marginBottom: "15px",
            color: "#1e3a8a",
            fontWeight: 600,
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🏢 Informations Société
        </h4>
     <input
        style={{
          ...styles.input,
          border: "1px solid #dbeafe",
          backgroundColor: "#f0f9ff",
        }}
        placeholder="Nom de la société (ex : GED IMMO SARL)"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        required
      />

      <input
        style={{
          ...styles.input,
          border: "1px solid #dbeafe",
          backgroundColor: "#f0f9ff",
        }}
        placeholder="Numéro d'identification (RCCM / NIF / ICE)"
        value={identificationNumber}
        onChange={(e) => setIdentificationNumber(e.target.value)}
        required
      />

      <input
        type="text"
        style={{
          ...styles.input,
          border: "1px solid #e0e7ff",
          backgroundColor: "#f5f7ff",
        }}
        placeholder="Mention légale / cachet électronique"
        value={legalMention}
        onChange={(e) => setLegalMention(e.target.value)}
      />

        {/* Upload logo obligatoire */}
        <div
          style={uploadBoxStyle}
          onClick={() => document.getElementById("logoInput").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
              const file = e.dataTransfer.files[0];
              setLogo(file);
              setLogoPreview(URL.createObjectURL(file));
            }
          }}
        >
          {logoPreview ? (
            <LogoPreview
              logoPreview={logoPreview}
              onRemove={() => {
                setLogo(null);
                setLogoPreview(null);
              }}
            />
          ) : (
            <>
              <p style={{ color: "#64748b", marginBottom: "6px" }}>
                Glissez ou cliquez pour ajouter le logo de la société
              </p>
              <small style={{ color: "#94a3b8" }}>PNG, JPG — max 2 Mo</small>
            </>
          )}
          <input
            id="logoInput"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setLogo(file);
              setLogoPreview(URL.createObjectURL(file));
            }}
            style={{ display: "none" }}
          />
        </div>
      </div>
    )}

    {/* 🔹 Bloc Particulier (optionnel logo) */}
    {typeAdmin === "particulier" && (
      <div
        style={{
          marginTop: "15px",
          backgroundColor: "#fdfdfd",
          borderRadius: "12px",
          border: "1px dashed #d1d5db",
          padding: "15px",
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: "10px", color: "#475569", fontSize: "0.95rem" }}>
          Ajouter un logo (optionnel)
        </p>
        <div
          style={uploadBoxStyle}
          onClick={() => document.getElementById("logoInputParticulier").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
              const file = e.dataTransfer.files[0];
              setLogo(file);
              setLogoPreview(URL.createObjectURL(file));
            }
          }}
        >
          {logoPreview ? (
            <LogoPreview
              logoPreview={logoPreview}
              onRemove={() => {
                setLogo(null);
                setLogoPreview(null);
              }}
            />
          ) : (
            <>
              <p style={{ color: "#94a3b8", marginBottom: "5px" }}>
                Glissez ou cliquez pour importer un logo personnel
              </p>
              <small style={{ color: "#cbd5e1" }}>Facultatif</small>
            </>
          )}
          <input
            id="logoInputParticulier"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setLogo(file);
              setLogoPreview(URL.createObjectURL(file));
            }}
            style={{ display: "none" }}
          />
        </div>
      </div>
    )}

    <button
  type="button"
  style={{
    ...styles.input,
    textAlign: "left",
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: "8px",
    padding: "10px",
  }}
  onClick={() => setShowSubscriptionModal(true)}
>
  {subscriptionType === "gratuit" && "Gratuit — 3 mois d’essai"}
  {subscriptionType === "standard" && "Standard — 60 000 FCFA / 6 mois"}
  {subscriptionType === "premium" && "Premium — 100 000 FCFA / an"}
</button>

<p style={styles.subscriptionInfo}>
  {subscriptionType === "gratuit" && "🆓 Votre essai gratuit dure 3 mois."}
  {subscriptionType === "standard" && "📅 Votre abonnement durera 6 mois."}
  {subscriptionType === "premium" && "💎 Votre abonnement premium durera 1 an."}
</p>

    <button type="submit" style={styles.button}>
      {loading ? "Inscription..." : "Créer un compte"}
    </button>
  </form>
)}

        {/* === RESET PASSWORD === */}
        {showResetPassword && (
          <div style={{ marginTop: "20px" }}>
            <h3>Réinitialiser le mot de passe</h3>
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
            <button style={styles.button} onClick={handleResetPassword}>
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* === Modal Aide === */}
      {showHelp && (
        <div style={styles.modalOverlay} onClick={() => setShowHelp(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>💡 Aide & FAQ</h2>
            <p>Suivez ces étapes pour configurer votre compte GED IMMO.</p>
            <button style={styles.closeBtn} onClick={() => setShowHelp(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}

     {/* === Modal Abonnement intégré === */}
{showSubscriptionModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}
    onClick={() => setShowSubscriptionModal(false)} // fermeture clic fond
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "15px",
        width: "90%",
        maxWidth: "400px",
        textAlign: "center"
      }}
      onClick={(e) => e.stopPropagation()} // empêcher propagation
    >
      <h2>💎 Sélection de votre abonnement</h2>

      {/* Select abonnement */}
      <select
        value={subscriptionType}
        onChange={(e) => setSubscriptionType(e.target.value)}
        style={{
          margin: "15px 0",
          padding: "10px",
          width: "100%",
          borderRadius: 8
        }}
      >
        <option value="gratuit">Gratuit — 3 mois d’essai</option>
        <option value="standard">Standard — 60 000 FCFA / 6 mois</option>
        <option value="premium">Premium — 100 000 FCFA / an</option>
      </select>

      {/* Détails abonnement */}
      <div style={{ textAlign: "left", marginTop: 10 }}>
        {subscriptionType === "gratuit" && (
          <>
            <h3>Gratuit — 3 mois d’essai 🆓</h3>
            <ul>
              <li>Accès limité aux fonctionnalités de base</li>
              <li>Nombre limité de projets ou documents</li>
              <li>Support standard par email</li>
            </ul>
          </>
        )}
        {subscriptionType === "standard" && (
          <>
            <h3>Standard — 60 000 FCFA / 6 mois 📅</h3>
            <ul>
              <li>Accès aux fonctionnalités principales</li>
              <li>Rapports et statistiques</li>
              <li>Support prioritaire par email</li>
            </ul>
          </>
        )}
        {subscriptionType === "premium" && (
          <>
            <h3>Premium — 100 000 FCFA / an 💎</h3>
            <ul>
              <li>Accès complet à toutes les fonctionnalités GED IMMO</li>
              <li>Gestion illimitée de projets et documents</li>
              <li>Support premium par email et téléphone</li>
              <li>Accès aux fonctionnalités avancées (export, analytics, notifications)</li>
            </ul>
          </>
        )}
      </div>

      <button
        style={{
          marginTop: 20,
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#3498db",
          color: "#fff",
          cursor: "pointer"
        }}
        onClick={() => setShowSubscriptionModal(false)}
      >
        Valider l’abonnement
      </button>
    </div>
  </div>
)}
    </div>
  );
}

// === Styles ===
const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f2f2f7", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" },
  assistHeader: { width: "100%", backgroundColor: "#fff", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginBottom: "30px", flexWrap: "wrap" },
  helpBtn: { backgroundColor: "#3498db", color: "#fff", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer" },
  authBox: { backgroundColor: "#fff", padding: "40px 30px", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", maxWidth: "420px", width: "90%", textAlign: "center" },
  logo: { width: "100px", height: "100px", objectFit: "contain", marginBottom: "15px" },
  title: { marginBottom: "15px", color: "#333" },
  tabContainer: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
  tabBtn: { flex: 1, padding: "10px", borderRadius: "8px", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" },
  button: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3498db", color: "#fff", fontSize: "1rem", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: "30px", borderRadius: "15px", textAlign: "center", width: "90%", maxWidth: "400px" },
  modalTitle: { marginBottom: "10px", fontSize: "1.5rem", color: "#333" },
  closeBtn: { marginTop: "15px", backgroundColor: "#3498db", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" },
  linksContainer: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  marginTop: "10px",
},

forgotLink: {
  color: "#2c3e50",
  fontWeight: "bold",
  textDecoration: "underline",
  cursor: "pointer",
  transition: "color 0.2s ease",
},
resendText: {
  fontSize: "0.9rem",
  color: "#555",
},
resendLink: {
  color: "#3498db",
  fontWeight: "bold",
  textDecoration: "underline",
  cursor: "pointer",
  transition: "color 0.2s ease",
},
};