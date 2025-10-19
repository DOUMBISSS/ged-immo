import React, { createContext, useContext, useState, useEffect } from "react";

const LocataireContext = createContext();

export const LocataireProvider = ({ children }) => {
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
    const expiry = Date.now() + 60 * 60 * 1000; // 1 heure
    setLocataire(locataireData);
    setToken(tokenData);
    setSessionExpiry(expiry);
    localStorage.setItem("locataire", JSON.stringify(locataireData));
    localStorage.setItem("locataireToken", tokenData);
    localStorage.setItem("locataireSessionExpiry", expiry.toString());
  };

  // ⚡ Déconnexion du locataire
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
    if (!sessionExpiry) return;

    const interval = setInterval(() => {
      if (Date.now() > sessionExpiry) {
        logoutLocataire();
        alert("Votre session a expiré. Veuillez vous reconnecter.");
      }
    }, 60 * 1000); // Vérifie chaque minute

    return () => clearInterval(interval);
  }, [sessionExpiry]);

  return (
    <LocataireContext.Provider
      value={{ locataire, token, loginLocataire, logoutLocataire }}
    >
      {children}
    </LocataireContext.Provider>
  );
};

// Hook pratique
export const useLocataire = () => useContext(LocataireContext);