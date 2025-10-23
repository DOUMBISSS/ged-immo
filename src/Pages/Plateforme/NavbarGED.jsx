// src/components/NavbarGED.jsx
import { useGedContext } from "../../contexts/GedContext";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function NavbarGED() {
  const { gedUser, logoutGed } = useGedContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const logoutHandler = () => {
    logoutGed();
    window.location.href = "/"; // ou navigate si tu veux react-router
  };

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
                  <p><strong>Nom :</strong> {gedUser.username || "N/A"}</p>
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
      `}</style>
    </div>
  );
}