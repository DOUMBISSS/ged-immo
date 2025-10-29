import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export default function RegisterGED() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { fullname, email, phone, company, password, confirmPassword } = formData;
    if (!fullname || !email || !password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://backend-ged-immo.onrender.com/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          email,
          phone,
          company,
          password,
          role: "admin",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur d'inscription");

      toast.success("Compte créé avec succès 🎉");
      navigate("/ged/login");
    } catch (err) {
      toast.error(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Bandeau assistance */}
      <div style={styles.assistHeader}>
        <p>
          <i className="fa-solid fa-phone"></i> Assistance : +225 07 77 88 00 82
        </p>
        <p>Email : support@gedimmo.com</p>
        <Link to="/ged/login" style={styles.link}>
          Déjà inscrit ? Connexion
        </Link>
      </div>

      {/* Formulaire d'inscription */}
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <img
            src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`}
            alt="Logo GED IMMO"
            style={styles.logo}
          />
          <h2 style={styles.title}>Créer un compte GED IMMO</h2>
          <p style={{ color: "#555", marginBottom: "20px" }}>
            Devenez propriétaire sur la plateforme GED IMMO
          </p>

          <form onSubmit={handleRegister} style={styles.form}>
            <input
              type="text"
              name="fullname"
              placeholder="Nom complet"
              value={formData.fullname}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Adresse e-mail"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Téléphone (facultatif)"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="text"
              name="company"
              placeholder="Nom de votre entreprise (facultatif)"
              value={formData.company}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmer mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p style={styles.loginLink}>
            Déjà un compte ?{" "}
            <Link to="/ged/login" style={styles.link}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
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
    flexWrap: "wrap",
    fontSize: "0.9rem",
  },
  link: {
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: "bold",
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
  logo: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
    marginBottom: "15px",
  },
  title: {
    marginBottom: "10px",
    color: "#1e3a8a",
    fontSize: "1.6rem",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "10px",
  },
  input: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
  loginLink: {
    marginTop: "15px",
    color: "#555",
    fontSize: "0.9rem",
  },
};