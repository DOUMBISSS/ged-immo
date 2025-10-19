import { Link, useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import { useUserContext } from "../contexts/UserContext";

export default function Navbar() {
  const [toggleHelp, setToggleHelp] = useState(false);
  const [fadeType, setFadeType] = useState(null);
  const [sidebar, setSidebar] = useState(false);
  const [toggleAssistance, setToggleAssistance] = useState(false); // nouvel état modal assistance
  const { user, logout, extendSession, showSessionModal, setShowSessionModal } = useUserContext();
  
  const navigate = useNavigate();

  const openSidebar = () => setSidebar(true);
  const closeSidebar = () => setSidebar(false);

  const openHelp = () => {
    setToggleHelp(true);
    setFadeType('in');
  };

  const closeHelp = () => {
    setFadeType('out');
    setTimeout(() => setToggleHelp(false), 300);
  };

  // --- Modal Assistance ---
  const openAssistance = () => {
    setToggleAssistance(true);
    setFadeType('in');
  };

  const closeAssistance = () => {
    setFadeType('out');
    setTimeout(() => setToggleAssistance(false), 300);
  };

  const logoutHandler = () => {
    logout();
    navigate("/");
  };

  const handleAssistanceSubmit = (e) => {
    e.preventDefault();
    // Ici tu peux appeler ton API pour envoyer le formulaire
    alert("Message envoyé au service assistance !");
    closeAssistance();
  };

  // --- Modal de connexion ---
const [showLoginModal, setShowLoginModal] = useState(false);
const [loginForm, setLoginForm] = useState({ username: "", password: "" });
const [loginLoading, setLoginLoading] = useState(false);
const [loginError, setLoginError] = useState("");
// --- 🔹 Modal Accès non autorisé ---
const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);

const openUnauthorizedModal = () => setShowUnauthorizedModal(true);
const closeUnauthorizedModal = () => setShowUnauthorizedModal(false);

const openLoginModal = () => setShowLoginModal(true);
const closeLoginModal = () => {
  setShowLoginModal(false);
  setLoginError("");
};

const handleLoginChange = (e) => {
  setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setLoginLoading(true);
  setLoginError("");

  try {
    const res = await fetch("http://localhost:4000/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginForm.username, // champ saisi dans le formulaire
        password: loginForm.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Identifiants incorrects");

    // 🧩 Vérifie que c’est bien un administrateur
    if (data.user?.role !== "admin") {
      throw new Error("Accès refusé : réservé aux administrateurs.");
    }

    // ✅ Sauvegarde dans le localStorage
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);

    // ✅ Redirection directe vers la page d'administration
    window.location.href = "/administrator";
  } catch (err) {
    console.error("Erreur de connexion :", err);
    setLoginError(err.message);
  } finally {
    setLoginLoading(false);
  }
};

  return (
    <div>
      <header>
        <div className="navbar--left">
          <div className="navbar--left--box">
            <Link to="/Accueil">
              <img src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`} alt="Logo" />
            </Link>
          </div>
        </div>

        <div className="navbar--center"></div>

        <div className="navbar--right">
       <button
  className="btn__admin"
  onClick={() => {
    if (user && user.role === "admin" && user.token) {
      navigate("/administrator");
    } else {
      openUnauthorizedModal();
    }
  }}
>
  <i className="fa-solid fa-user"></i> Admin
</button>
            <button onClick={openAssistance} className="btn__assistance">Service Assistance</button>
          <button className="btn__help" onClick={openHelp}>
            <i className="fa-solid fa-circle-question"></i> Aides
          </button>
          {user ? (
            <>
              <span>{user.username}</span>
              <button onClick={logoutHandler} className="btn__logout">Logout</button>
            
            </>
          ) : (
            <Link to="/login" className="btn__login">
              Login
            </Link>
          )}
        </div>
      </header>

      <nav className="navbar-menu">
        <NavLink to="/Accueil" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-boxes-stacked me-2"></i> Accueil
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-users"></i> Locataires
        </NavLink>
        <NavLink to="/Mes__projet/fr/" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-house"></i> Mes propriétés
        </NavLink>
        <NavLink to="/statistiques" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-chart-line"></i> Statistiques
        </NavLink>
        <NavLink to="/Mes__archives" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-box-archive"></i> Archives
        </NavLink>
         <NavLink to="/Ma__comptabilite" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-calculator"></i> Ma comptabilité
        </NavLink>
          <NavLink to="/Notifications" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-box-archive"></i> Notifications
        </NavLink>
        <NavLink to="/mon-profil" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fa-solid fa-user"></i> Profil
        </NavLink>
      </nav>

      {/* --- Modal Assistance --- */}
      {toggleAssistance && (
        <div className={`help-modal ${fadeType === 'in' ? 'fade-in' : 'fade-out'}`}>
          <div className="help-modal-content shadow-lg p-4 rounded-4 bg-white position-relative">
            <h3 className="mb-4 text-primary">
              <i className="fa-solid fa-headset me-2"></i> Service Assistance
            </h3>
            <form onSubmit={handleAssistanceSubmit} className="text-start">
              <div className="mb-3">
                <label className="form-label">Nom</label>
                <input type="text" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="4" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-2">Envoyer</button>
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
  <div className={`help-modal ${fadeType === 'in' ? 'fade-in' : 'fade-out'}`}>
    <div className="help-modal-content shadow-lg p-4 rounded-4 bg-white position-relative">

      <h3 className="mb-4 text-primary">
        <i className="fa-solid fa-circle-question me-2"></i> Aide & FAQ
      </h3>
      <p className="text-muted mb-4">Suivez les étapes ci-dessous pour gérer vos projets, locataires et paiements :</p>

      <div className="accordion" id="helpAccordion">

        {/* 1. Créer un projet */}
        <div className="accordion-item border-0 mb-2 shadow-sm rounded-3 overflow-hidden">
          <h2 className="accordion-header" id="headingProject">
            <button className="accordion-button collapsed d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseProject" aria-expanded="false" aria-controls="collapseProject">
              <i className="fa-solid fa-diagram-project me-2 text-primary"></i> Créer un projet
            </button>
          </h2>
          <div id="collapseProject" className="accordion-collapse collapse" aria-labelledby="headingProject" data-bs-parent="#helpAccordion">
            <div className="accordion-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Créez d'abord un projet en donnant un nom.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Les maisons seront ensuite affectées à ce projet lors de leur création.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Ajouter un locataire */}
        <div className="accordion-item border-0 mb-2 shadow-sm rounded-3 overflow-hidden">
          <h2 className="accordion-header" id="headingTenant">
            <button className="accordion-button collapsed d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTenant" aria-expanded="false" aria-controls="collapseTenant">
              <i className="fa-solid fa-user-plus me-2 text-primary"></i> Ajouter un locataire
            </button>
          </h2>
          <div id="collapseTenant" className="accordion-collapse collapse" aria-labelledby="headingTenant" data-bs-parent="#helpAccordion">
            <div className="accordion-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Remplissez le formulaire de création de locataire.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Les maisons créées précédemment seront disponibles pour l’affectation.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Ajoutez les documents du locataire (pièce, contrat de bail, etc.).</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Transmettez les accès au locataire.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Ajouter un paiement */}
        <div className="accordion-item border-0 mb-2 shadow-sm rounded-3 overflow-hidden">
          <h2 className="accordion-header" id="headingPayment">
            <button className="accordion-button collapsed d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePayment" aria-expanded="false" aria-controls="collapsePayment">
              <i className="fa-solid fa-money-bill-wave me-2 text-primary"></i> Ajouter un paiement
            </button>
          </h2>
          <div id="collapsePayment" className="accordion-collapse collapse" aria-labelledby="headingPayment" data-bs-parent="#helpAccordion">
            <div className="accordion-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Accédez à la section Paiements.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Sélectionnez le locataire concerné.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Renseignez le montant et la date du paiement.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Validez pour enregistrer le paiement.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Gérer les documents */}
        <div className="accordion-item border-0 mb-2 shadow-sm rounded-3 overflow-hidden">
          <h2 className="accordion-header" id="headingDocuments">
            <button className="accordion-button collapsed d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDocuments" aria-expanded="false" aria-controls="collapseDocuments">
              <i className="fa-solid fa-file-lines me-2 text-primary"></i> Gérer les documents
            </button>
          </h2>
          <div id="collapseDocuments" className="accordion-collapse collapse" aria-labelledby="headingDocuments" data-bs-parent="#helpAccordion">
            <div className="accordion-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Ajoutez ou supprimez des documents pour chaque locataire.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Téléchargez les PDF ou images associés.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Assurez-vous que chaque document est correctement nommé et daté.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 5. Archivage des logements */}
        <div className="accordion-item border-0 mb-2 shadow-sm rounded-3 overflow-hidden">
          <h2 className="accordion-header" id="headingArchive">
            <button className="accordion-button collapsed d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseArchive" aria-expanded="false" aria-controls="collapseArchive">
              <i className="fa-solid fa-archive me-2 text-primary"></i> Archiver un logement
            </button>
          </h2>
          <div id="collapseArchive" className="accordion-collapse collapse" aria-labelledby="headingArchive" data-bs-parent="#helpAccordion">
            <div className="accordion-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Sélectionnez le logement à archiver.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Vérifiez que toutes les informations et documents sont complets.</li>
                <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i>Validez pour déplacer le logement dans l’historique.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      <button onClick={closeHelp} className="btn btn-danger mt-4 w-100">
        <i className="fa-solid fa-xmark me-2"></i> Fermer
      </button>
    </div>

    <div className="help-modal-overlay" onClick={closeHelp}></div>
  </div>
)}
  {showSessionModal && (
        <div className="session-modal-overlay">
          <div className="session-modal">
            <h3>⚠️ Session bientôt expirée</h3>
            <p>Votre session expire dans moins de 5 minutes. Voulez-vous rester connecté ?</p>
            <div className="buttons">
              <button className="btn btn-primary" onClick={extendSession}>
                Rester connecté
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowSessionModal(false);
                  logout();
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal Connexion --- */}
{/* {showLoginModal && (
  <div className="admin-login-modal" onClick={closeLoginModal}>
    <div className="admin-login-modal-content" onClick={(e) => e.stopPropagation()}>
      <h3><i className="fa-solid fa-lock me-2"></i> Connexion Admin</h3>

      {loginError && <div className="alert alert-danger">{loginError}</div>}

      <form onSubmit={handleLoginSubmit}>
       <div className="mb-3 text-start">
          <label>Email administrateur</label>
          <input
            type="email"
            name="username"
            className="form-control"
            placeholder="ex: admin@purepro.com"
            value={loginForm.username}
            onChange={handleLoginChange}
            required
          />
        </div>

        <div className="mb-3 text-start">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={loginForm.password}
            onChange={handleLoginChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          {loginLoading ? "Connexion..." : "Se connecter"}
        </button>
        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={closeLoginModal}>
          Fermer
        </button>
      </form>
    </div>
  </div>
)} */}
{/* === MODAL : Accès non autorisé === */}
{showUnauthorizedModal && (
  <div className="unauthorized-modal" onClick={closeUnauthorizedModal}>
    <div
      className="unauthorized-modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>🚫 Accès non autorisé</h2>
      <p>Cette section est réservée aux administrateurs.</p>
      <p>Veuillez contacter l’administrateur si vous pensez qu’il s’agit d’une erreur.</p>

      <button
        onClick={closeUnauthorizedModal}
        className="btn btn-danger w-100 mt-3"
      >
        <i className="fa-solid fa-xmark me-2"></i> Fermer
      </button>
    </div>
  </div>
)}


      {/* --- Styles pour le modal --- */}
      <style>{`
        .help-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 1;
          transition: opacity 0.3s ease;
          width:100%
        }
        .help-modal.fade-in {
          opacity: 1;
        }
        .help-modal.fade-out {
          opacity: 0;
        }
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
          max-width: 80%;
          width: 100%;
          z-index: 1001;
          text-align: center;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .btn__close-help {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: coral;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
        }
          .session-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .session-modal {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .session-modal h3 {
          margin-bottom: 1rem;
          color: #d9534f;
        }
        // .buttons {
        //   margin-top: 1.5rem;
        //   display: flex;
        //   gap: 1rem;
        //   justify-content: center;
        // }

        /* === MODAL DE CONNEXION === */
.login-modals {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.login-modal-contents {
  background: #fff;
  border-radius: 12px;
  width: 95%;
  max-width: 420px;
  padding: 2rem;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.3s ease-out;
  position: relative;
}

.login-modal-content h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2563eb;
  text-align: center;
}

.login-modal-content .form-label {
  font-weight: 500;
  color: #374151;
}

.login-modal-content .form-control {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.login-modal-content .form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.login-modal-content .btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 0.6rem 1rem;
  transition: all 0.2s ease;
}

.login-modal-content .btn-primary {
  background: #2563eb;
  border: none;
}

.login-modal-content .btn-primary:hover {
  background: #1d4ed8;
}

.login-modal-content .btn-secondary {
  background: #e5e7eb;
  color: #374151;
  border: none;
}

.login-modal-content .btn-secondary:hover {
  background: #d1d5db;
}

.login-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.alert {
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* Animation d’apparition du modal */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
  .admin-login-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.admin-login-modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 6px 25px rgba(0,0,0,0.25);
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px);}
  to { opacity: 1; transform: translateY(0);}
}

.alert { margin-bottom: 1rem; text-align: center; }
 /* === MODAL ACCÈS NON AUTORISÉ === */
.unauthorized-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.unauthorized-modal-content {
  background: #fff;
  border-radius: 10px;
  padding: 2rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
  animation: fadeInUp 0.3s ease-out;
}

.unauthorized-modal-content h2 {
  color: #d9534f;
  margin-bottom: 0.5rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
      `}</style>
    </div>
  );
}