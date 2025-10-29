import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocataire } from "../../contexts/LocataireContext";
import toast from "react-hot-toast";

const API = "https://backend-ged-immo.onrender.com"; // <-- Remplace par ton API réelle

export default function NavbarLoc() {
  const [toggleHelp, setToggleHelp] = useState(false);
  const [fadeType, setFadeType] = useState(null);
  const [toggleAssistance, setToggleAssistance] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [message, setMessage] = useState({ fromName: "", fromEmail: "", message: "" });
  const [sending, setSending] = useState(false);

  const { locataire, logoutLocataire } = useLocataire();
  const navigate = useNavigate();

  // --- Récupération de l'admin lié au locataire ---
  // useEffect(() => {
  //   const fetchAdmin = async () => {
  //     if (!locataire?._id) return;

  //     try {
  //       const resLoc = await fetch(`${API}/detail/locataire/${locataire._id}`);
  //       if (!resLoc.ok) throw new Error("Erreur récupération locataire");
  //       const locData = await resLoc.json();

  //       if (!locData.adminId) {
  //         toast.error("Admin non assigné à ce locataire !");
  //         return;
  //       }

  //       const resAdmin = await fetch(`${API}/admin/${locData.adminId}`);
  //       if (!resAdmin.ok) throw new Error("Admin introuvable");
  //       const adminData = await resAdmin.json();
  //       setAdmin(adminData);
  //     } catch (err) {
  //       console.error("Erreur récupération admin :", err);
  //       toast.error(err.message || "Impossible de récupérer les informations de l'admin");
  //     }
  //   };

  //   fetchAdmin();
  // }, [locataire]);

  // --- Modals ---
  const openHelp = () => { setToggleHelp(true); setFadeType("in"); };
  const closeHelp = () => { setFadeType("out"); setTimeout(() => setToggleHelp(false), 300); };
  const openAssistance = () => { setToggleAssistance(true); setFadeType("in"); };
  const closeAssistance = () => { setFadeType("out"); setTimeout(() => setToggleAssistance(false), 300); };

  const logoutHandler = () => {
    logoutLocataire();
    navigate("/Mon__compte");
  };

  const handleAssistanceSubmit = async (e) => {
    e.preventDefault();

    if (!locataire) return toast.error("Erreur : locataire non identifié !");
    if (!admin || !admin.email) return toast.error("Impossible d'envoyer le message : admin introuvable ou email manquant.");
    if (!message.message.trim()) return toast.error("Veuillez saisir un message avant d'envoyer.");

    const formData = {
      fromName: message.fromName || locataire.name || locataire.lastname || "",
      fromEmail: message.fromEmail || locataire.email || "",
      toEmail: admin.email,
      message: message.message
    };

    try {
      setSending(true);
      const res = await fetch(`${API}/send-assistance-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Votre message a été envoyé au service assistance !");
        setMessage({ fromName: "", fromEmail: "", message: "" });
        closeAssistance();
      } else {
        toast.error(data.message || "Erreur lors de l'envoi du message.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau, réessayez plus tard.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <header>
        <div className="navbar--left">
          <Link to="/Accueil">
            <img src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`} alt="Logo" />
          </Link>
        </div>

        <div className="navbar--right">
          <button onClick={openAssistance} className="btn__assistance">Service Assistance</button>
          <button onClick={openHelp} className="btn__help">
            <i className="fa-solid fa-circle-question"></i> Aide
          </button>
          {locataire ? (
            <>
              <span>
                {locataire.username || locataire.name} {admin ? `- Admin: ${admin.fullname} (${admin.number})` : ""}
              </span>
              <button onClick={logoutHandler} className="btn__logout">
                <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
              </button>
            </>
          ) : (
            <Link to="/" className="btn__login">Connexion</Link>
          )}
        </div>
      </header>

      {/* --- Modal Assistance --- */}
      {toggleAssistance && (
        <div className={`help-modal ${fadeType === "in" ? "fade-in" : "fade-out"}`}>
          <div className="help-modal-content shadow-lg p-4 rounded-4 bg-white position-relative">
            <h3 className="mb-4 text-primary">
              <i className="fa-solid fa-headset me-2"></i> Service Assistance
            </h3>
            {locataire && (
              <span>
                {locataire.username || locataire.name}{" "}
                {admin ? `- Admin: ${admin.fullname} (${admin.number})` : ""}
              </span>
            )}
            <form onSubmit={handleAssistanceSubmit} className="text-start mt-3">
              <div className="mb-3">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  className="form-control"
                  value={message.fromName || locataire?.name || locataire?.lastname || ""}
                  onChange={e => setMessage(prev => ({ ...prev, fromName: e.target.value }))}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={message.fromEmail || locataire?.email || ""}
                  onChange={e => setMessage(prev => ({ ...prev, fromEmail: e.target.value }))}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={message.message || ""}
                  onChange={e => setMessage(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Votre message..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-2" disabled={sending}>
                {sending ? "Envoi..." : "Envoyer"}
              </button>
              <button type="button" className="btn btn-danger w-100" onClick={closeAssistance}>
                <i className="fa-solid fa-xmark me-2"></i> Fermer
              </button>
            </form>
          </div>
          <div className="help-modal-overlay" onClick={closeAssistance}></div>
        </div>
      )}

      {/* --- Modal Aide --- */}
      {toggleHelp && (
        <div className={`help-modal ${fadeType === "in" ? "fade-in" : "fade-out"}`}>
          <div className="help-modal-content shadow-lg p-4 rounded-4 bg-white position-relative">
            <h3 className="mb-4 text-primary">
              <i className="fa-solid fa-circle-question me-2"></i> Aide locataire
            </h3>
            <p>Bienvenue dans votre espace locataire. Voici quelques conseils :</p>
            <ul className="text-start">
              <li><i className="fa-solid fa-check text-success me-2"></i> Consultez vos loyers et paiements.</li>
              <li><i className="fa-solid fa-check text-success me-2"></i> Téléchargez vos reçus à tout moment.</li>
            </ul>
            <button onClick={closeHelp} className="btn btn-danger mt-4 w-100">
              <i className="fa-solid fa-xmark me-2"></i> Fermer
            </button>
          </div>
          <div className="help-modal-overlay" onClick={closeHelp}></div>
        </div>
      )}
  
      <style>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 10px 20px;
          color: #1976d2;
          font-family: 'Segoe UI', Tahoma, sans-serif;
        }
        .navbar--left img {
          width: 90px;
          border-radius: 6px;
        }
        .navbar--right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn__assistance, .btn__help, .btn__logout, .btn__login {
          background: transparent;
          border: none;
          color: #1976d2;
          cursor: pointer;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .btn__logout:hover, .btn__login:hover { text-decoration: underline; }
        .help-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        .help-modal.fade-in { opacity: 1; }
        .help-modal.fade-out { opacity: 0; }
        .help-modal-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
        }
        .help-modal-content {
          position: relative;
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          z-index: 1001;
          text-align: center;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
      `}</style>
    </div>
  );
}