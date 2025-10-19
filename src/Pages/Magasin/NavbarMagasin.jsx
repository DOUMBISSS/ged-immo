import { Link, useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import { useUserMagasin } from "../../contexts/UserMagasinContext";
import { toast } from "react-hot-toast";

export default function NavbarMagasin() {
  const [toggleHelp, setToggleHelp] = useState(false);
  const [fadeType, setFadeType] = useState(null);
  const [toggleAssistance, setToggleAssistance] = useState(false);
  const navigate = useNavigate();

  const { magasinUser, logoutMagasinUser } = useUserMagasin();

  const openHelp = () => {
    setToggleHelp(true);
    setFadeType("in");
  };

  const closeHelp = () => {
    setFadeType("out");
    setTimeout(() => setToggleHelp(false), 300);
  };

  const openAssistance = () => {
    setToggleAssistance(true);
    setFadeType("in");
  };

  const closeAssistance = () => {
    setFadeType("out");
    setTimeout(() => setToggleAssistance(false), 300);
  };

  const logoutHandler = () => {
    logoutMagasinUser();
    navigate("/login-magasin");
  };

  const handleAssistanceSubmit = (e) => {
    e.preventDefault();
    toast.success("Message envoyé au service assistance !");
    closeAssistance();
  };

  return (
    <div>
      <header>
        <div className="navbar--left">
          <div className="navbar--left--box">
            <Link to="/home-magasin">
              <img
                src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`}
                alt="Logo GED Immo"
              />
            </Link>
          </div>
        </div>

        <div className="navbar--right">
          <button onClick={openAssistance} className="btn__assistance">
            <i className="fa-solid fa-headset me-2"></i> Assistance
          </button>
          <button onClick={openHelp} className="btn__help">
            <i className="fa-solid fa-circle-question"></i> Aide
          </button>

          {magasinUser ? (
            <>
              <span>
                {magasinUser.fullname}{" "}
                <small style={{ color: "#555" }}>
                  ({magasinUser.role || "propriétaire"})
                </small>
              </span>
              <button onClick={logoutHandler} className="btn__logout">
                <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login-magasin" className="btn__login">
              <i className="fa-solid fa-user"></i> Connexion
            </Link>
          )}
        </div>
      </header>

      {/* --- Navigation principale --- */}
      <nav className="navbar-menu">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="fa-solid fa-shop me-2"></i> Tableau de bord
        </NavLink>
        <NavLink to="/home-magasin" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="fa-solid fa-store me-2"></i> Mes magasins
        </NavLink>
        <NavLink to="/liste/fr/" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="fa-solid fa-users me-2"></i> Locataires
        </NavLink>
        <NavLink to="/paiements-magasin" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="fa-solid fa-money-bill-wave me-2"></i> Paiements
        </NavLink>
        <NavLink to="/documents-magasin" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="fa-solid fa-file-lines me-2"></i> Documents
        </NavLink>
        <NavLink to="/Mon/profil" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="fa-solid fa-user me-2"></i> Profil
        </NavLink>
      </nav>

      {/* --- Modal Assistance --- */}
      {toggleAssistance && (
        <div className={`help-modal ${fadeType === "in" ? "fade-in" : "fade-out"}`}>
          <div className="help-modal-content shadow-lg p-4 rounded-4 bg-white position-relative">
            <h3 className="mb-4 text-primary">
              <i className="fa-solid fa-headset me-2"></i> Service Assistance
            </h3>
            <form onSubmit={handleAssistanceSubmit} className="text-start">
              <div className="mb-3">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={magasinUser?.fullname || ""}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  defaultValue={magasinUser?.email || ""}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="4" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-2">
                Envoyer
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
              <i className="fa-solid fa-circle-question me-2"></i> Aide & FAQ
            </h3>
            <ul className="text-start">
              <li><i className="fa-solid fa-check text-success me-2"></i> Gérez vos magasins et locataires.</li>
              <li><i className="fa-solid fa-check text-success me-2"></i> Suivez vos paiements et contrats.</li>
              <li><i className="fa-solid fa-check text-success me-2"></i> Contactez l’assistance en cas de besoin.</li>
            </ul>
            <button onClick={closeHelp} className="btn btn-danger mt-4 w-100">
              <i className="fa-solid fa-xmark me-2"></i> Fermer
            </button>
          </div>
          <div className="help-modal-overlay" onClick={closeHelp}></div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 10px 20px;
          color: #1976d2;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          border-bottom: 1px solid #e0e0e0;
          z-index: 1200;
          position: relative;
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
        .navbar-menu {
          background: #f8fafc;
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding: 0.8rem;
          border-bottom: 1px solid #e5e7eb;
          z-index: 1100;
          position: relative;
        }
        .navbar-menu a {
          color: #374151;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: background 0.2s ease;
        }
        .navbar-menu a.active, .navbar-menu a:hover {
          background: #1976d2;
          color: white;
        }
        .help-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 1;
          transition: opacity 0.25s ease;
        }
        .help-modal.fade-in { opacity: 1; }
        .help-modal.fade-out { opacity: 0; pointer-events: none; }
        .help-modal-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
        }
        .help-modal-content {
          position: relative;
          background: #fff;
          padding: 2rem;
          border-radius: 10px;
          max-width: 500px;
          width: 90%;
          z-index: 10000;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          text-align: left;
        }

        /* petites responsive */
        @media (max-width: 700px) {
          .navbar-menu { flex-wrap: wrap; }
          header { padding: 8px 12px; }
        }
      `}</style>
    </div>
  );
}