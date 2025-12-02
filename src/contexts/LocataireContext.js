import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LocataireContext = createContext();

export const LocataireProvider = ({ children }) => {
  const navigate = useNavigate();

  // 🔹 Initialisation à partir du localStorage
  const [locataire, setLocataire] = useState(() => {
    const stored = localStorage.getItem("locataire");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("locataireToken") || null);

  const [sessionExpiry, setSessionExpiry] = useState(() => {
    const saved = localStorage.getItem("locataireSessionExpiry");
    return saved ? parseInt(saved, 10) : null;
  });

  // ⚡ Connexion du locataire
  const loginLocataire = (locataireData, tokenData) => {
    const expiry = Date.now() + 60 * 60 * 1000; // ⏰ expire après 1h
    setLocataire(locataireData);
    setToken(tokenData);
    setSessionExpiry(expiry);
    localStorage.setItem("locataire", JSON.stringify(locataireData));
    localStorage.setItem("locataireToken", tokenData);
    localStorage.setItem("locataireSessionExpiry", expiry.toString());
  };

  // 🚪 Déconnexion du locataire
  const logoutLocataire = () => {
    setLocataire(null);
    setToken(null);
    setSessionExpiry(null);
    localStorage.removeItem("locataire");
    localStorage.removeItem("locataireToken");
    localStorage.removeItem("locataireSessionExpiry");
  };

  // 🔁 Vérification automatique de l’expiration de session
  useEffect(() => {
    const checkSession = () => {
      const expiry = localStorage.getItem("locataireSessionExpiry");
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        logoutLocataire();
        toast.error("⏰ Votre session a expiré, veuillez vous reconnecter.");
        navigate("/Mon__compte");
      }
    };

    // ✅ Vérifie tout de suite au chargement
    checkSession();

    // ✅ Vérifie toutes les 2 minutes
    const interval = setInterval(checkSession, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <LocataireContext.Provider
      value={{ locataire, token, loginLocataire, logoutLocataire }}
    >
      {children}
    </LocataireContext.Provider>
  );
};

// 🔹 Hook pratique pour utiliser le contexte
export const useLocataire = () => useContext(LocataireContext);