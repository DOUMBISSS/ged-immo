// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const SESSION_DURATION = 60 * 60 * 1000; // 1 heure
const WARNING_DURATION = 60 * 1000; // 1 minute avant la fin
const INACTIVITY_LIMIT = SESSION_DURATION; // 1h sans activité

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Erreur lecture localStorage:", err);
      return null;
    }
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const countdownInterval = useRef(null);
  const logoutTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const lastActivity = useRef(Date.now());
  const activityListenerAttached = useRef(false);

  // ✅ Sauvegarde auto dans localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // ✅ Connexion
  const login = (userData) => {
    if (!userData || !userData._id)
      return console.error("ID utilisateur manquant !");
    const userWithSession = {
      ...userData,
      id: userData._id,
      isAdmin: userData.role === "admin",
      userId: userData.role !== "admin" ? userData._id : null,
      adminId:
        userData.role === "admin"
          ? userData._id
          : userData.adminId || null,
      token: userData.token || null,
    };
    setUser(userWithSession);
    startSessionTimer(); // Démarre la session
  };

// ✅ Déconnexion simple avec redirection vers la home
const logout = () => {
  clearSessionTimers();
  setUser(null);
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  setShowLogoutModal(false);
  setShowSessionWarning(false);

  // Optionnel : toast pour informer l'utilisateur
  toast.success("Déconnexion réussie 👋", {
    id: "logout-success",
    duration: 3000,
    position: "top-right",
    style: { zIndex: 9999 }
  });

  // Redirection vers la page d'accueil
  window.location.href = "/";
};

  // ✅ Ouvrir / Fermer la modal
  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  // ✅ Timer principal de session
  const startSessionTimer = () => {
    clearSessionTimers();

    const now = Date.now();
    lastActivity.current = now;

    // Avertissement à 59e minute
    warningTimeout.current = setTimeout(() => {
      setShowSessionWarning(true);
      setCountdown(60);

      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current);
            logout();
            toast.error("Session expirée ⏱️");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_DURATION - WARNING_DURATION);

    // Expiration réelle à 1h
    logoutTimeout.current = setTimeout(() => {
      logout();
      toast.error("Votre session a expiré automatiquement ⏱️");
    }, SESSION_DURATION);
  };

  const clearSessionTimers = () => {
    if (logoutTimeout.current) clearTimeout(logoutTimeout.current);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };

  // ✅ Gestion de l’activité utilisateur
  const handleUserActivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity.current;
    lastActivity.current = now;

    // Si on est toujours avant l’expiration → on réinitialise
    if (timeSinceLastActivity < INACTIVITY_LIMIT) {
      if (showSessionWarning) {
        setShowSessionWarning(false);
        toast.success("Session prolongée automatiquement ⏳");
      }
      startSessionTimer();
    }
  };

  // ✅ Surveillance d’inactivité
  useEffect(() => {
    if (!user) return;

    if (!activityListenerAttached.current) {
      const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
      events.forEach((event) => window.addEventListener(event, handleUserActivity));
      activityListenerAttached.current = true;
    }

    startSessionTimer();

    return () => {
      clearSessionTimers();
      if (activityListenerAttached.current) {
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((event) => window.removeEventListener(event, handleUserActivity));
        activityListenerAttached.current = false;
      }
    };
  }, [user]);

  // ✅ Login Handler global
  const loginHandler = async (role, emailOrUsername, password, navigate) => {
    try {
      const endpoint =
        role === "admin"
          ? "https://backend-ged-immo.onrender.com/admin/login"
          : "https://backend-ged-immo.onrender.com/user/login";

      const body =
        role === "admin"
          ? { email: emailOrUsername.trim(), password: password.trim(), role }
          : { username: emailOrUsername.trim(), password: password.trim(), role };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Identifiants incorrects");
        return null;
      }

      if (!data.user || !data.token) {
        toast.error("Impossible de récupérer les informations de l'utilisateur");
        return null;
      }

      login({ ...data.user, token: data.token, role });
      localStorage.setItem("token", data.token);

      toast.success(`Bienvenue, ${data.user.fullname || data.user.name || "Utilisateur"} 👋`,)


      navigate(role === "admin" ? "/administrator" : "/");
      return data.user;
    } catch (error) {
      console.error("Erreur serveur :", error);
      toast.error("Erreur serveur, réessayez plus tard");
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loginHandler,
        showLogoutModal,
        openLogoutModal,
        closeLogoutModal,
      }}
    >
      {children}

      {/* ✅ Modal de déconnexion manuelle */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={closeLogoutModal}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Voulez-vous vraiment vous déconnecter ?</h3>
            <div className="logout-actions">
              <button className="btn-confirm" onClick={logout}>
                Oui, déconnecter
              </button>
              <button className="btn-cancel" onClick={closeLogoutModal}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Modal d’avertissement de session */}
      {showSessionWarning && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Votre session expirera dans {countdown} seconde(s)</h3>
            <p>Souhaitez-vous prolonger votre session ?</p>
            <div className="logout-actions">
              <button
                className="btn-confirm"
                onClick={() => {
                  setShowSessionWarning(false);
                  startSessionTimer();
                  toast.success("Session prolongée ⏳");
                }}
              >
                Oui, prolonger
              </button>
              <button className="btn-cancel" onClick={logout}>
                Déconnecter maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .logout-modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 2000;
        }
        .logout-modal {
          background: #fff;
          padding: 2rem;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          max-width: 350px;
          animation: pop 0.3s ease-in-out;
        }
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .logout-modal h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: #333;
        }
        .logout-modal p {
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          color: #555;
        }
        .logout-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }
        .btn-confirm {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-confirm:hover { background: #1d4ed8; }
        .btn-cancel {
          background: #e5e7eb;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-cancel:hover { background: #d1d5db; }
      `}</style>
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserContext doit être utilisé dans un UserProvider");
  return context;
}