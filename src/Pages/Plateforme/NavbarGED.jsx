import { useGedContext } from "../../contexts/GedContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function NavbarGED() {
  const { gedUser, logoutGed, notifications } = useGedContext(); // récupère les notifications
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
const prevNotificationsRef = useRef([]);
const [loading, setLoading] = useState(false);


  // 🔹 Récupération des notifications "en attente"
  const fetchNotifications = useCallback(async () => {
    if (!gedUser?.token) return;
    setLoading(true);
    try {
      const res = await fetch("https://backend-ged-immo.onrender.com/gedimmo/notifications", {
        headers: { Authorization: `Bearer ${gedUser.token}` },
      });
      const data = await res.json();

      if (data.success) {
        // 🔹 Filtrer uniquement les notifications "en_attente"
        const pendingNotifs = data.data.filter((n) => n.status === "en_attente");

        // 🔹 Identifiants déjà connus (en attente uniquement)
        const prevIds = prevNotificationsRef.current.map((n) => n._id);

        // 🔹 Nouvelles notifications non vues
        const newNotifs = pendingNotifs.filter((n) => !prevIds.includes(n._id));

        if (newNotifs.length > 0) {
          newNotifs.forEach((n) =>
            toast(`📩 Nouvelle demande : ${n.message}`, { icon: "🆕" })
          );
        }

        // 🔹 Mémoriser uniquement celles en attente
        prevNotificationsRef.current = pendingNotifs;

        // 🔹 Mettre à jour le compteur réel
        setNotifCount(pendingNotifs.length);
      } else {
        toast.error("Erreur lors du chargement des notifications");
      }
    } catch (err) {
      console.error("Erreur fetch notifications :", err);
      toast.error("Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  }, [gedUser]);

  // 🔁 Auto-refresh toutes les 20 secondes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);


  const logoutHandler = () => {
    logoutGed();
    window.location.href = "/login/ged/admin";
  };

  // Met à jour le nombre de notifications réel
  useEffect(() => {
    if (Array.isArray(notifications)) {
      setNotifCount(notifications.length);
    }
  }, [notifications]);

  return (
    <div>
      <header className="navbar-ged">
        <div className="navbar-left">
          <div className="navbar--left--box">
            <Link to="/Accueil">
              <img src={`${process.env.PUBLIC_URL}/logo4 copie.jpg`} alt="Logo" />
            </Link>
          </div>
        </div>

        {gedUser && (
          <>
            <div className="navbar-right">
              <div className="user-dropdown-container">
                <button
                  className="btn__profile"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <i className="fa-solid fa-user-circle me-1"></i>
                  {gedUser.username || gedUser.email}
                  <i
                    className={`fa-solid fa-chevron-${showProfileMenu ? "up" : "down"} ms-2`}
                  ></i>
                </button>

                {showProfileMenu && (
                  <div className="user-dropdown">
                    <p><strong>Nom :</strong> {gedUser.name || "N/A"}</p>
                    {gedUser.fullname && <p><strong>Nom complet :</strong> {gedUser.fullname}</p>}
                    {gedUser.email && <p><strong>Email :</strong> {gedUser.email}</p>}
                    <p><strong>Rôle :</strong> {gedUser.role || "Utilisateur"}</p>
                    <hr />
                    <button onClick={logoutHandler} className="dropdown-logout-btn">
                      <i className="fa-solid fa-right-from-bracket me-2"></i> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Link to="/ged/notifications/fr/">
                <button className="btn__notification">
                  <span className="notification-icon">🔔</span>
                  <span className="notification-text">Notifications</span>
                  <span className="notification-badge">{notifCount}</span>
                </button>
              </Link>
            </div>
          </>
        )}
      </header>

      {/* === Styles === */}
      <style>{`
        .navbar-ged {
          // background: #1e3a8a;
          color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .navbar-logo {
          width: 45px;
          height: 45px;
          object-fit: contain;
          border-radius: 50%;
          background: white;
          padding: 5px;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        /* === Bouton Profil === */
        .btn__profile {
          background: transparent;
          border: 1px solid #ccc;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 15px;
          color: #1e3a8a;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        .btn__profile:hover {
          background: rgba(255,255,255,0.1);
        }

        /* === Conteneur dropdown === */
        .user-dropdown-container {
          position: relative;
          display: inline-block;
        }

        /* === Menu déroulant === */
        .user-dropdown {
          position: absolute;
          top: 110%;
          right: 0;
          background: #1e3a8a;
          border-radius: 8px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          width: 230px;
          padding: 12px;
          z-index: 1000;
          animation: fadeInDown 0.25s ease-out;
          color: #fff;
        }

        .user-dropdown p {
          margin: 6px 0;
          font-size: 14px;
          color: #e2e8f0;
        }

        .user-dropdown hr {
          margin: 10px 0;
          border: none;
          border-top: 1px solid #3b82f6;
        }

        .dropdown-logout-btn {
          background: #f87171;
          color: white;
          border: none;
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .dropdown-logout-btn:hover {
          background: #dc2626;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
 .btn__notification {
  position: relative;
  background-color: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  text-decoration:none;
}

.btn__notification:hover {
  background-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn__notification:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Badge notification */
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
          
      `}</style>
    </div>
  );
}