// src/contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { SUBSCRIPTION_LIMITS } from "../subscriptionLimits";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userSessions, setUserSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userSessions")) || {};
    } catch {
      return {};
    }
  });

  const [activeSessionToken, setActiveSessionToken] = useState(() => {
    return localStorage.getItem("activeSessionToken") || null;
  });

  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const logoutTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const countdownInterval = useRef(null);

  // 🔹 Synchronisation multi-onglet
  useEffect(() => {
    const handleStorage = e => {
      if (e.key === "activeSessionToken") setActiveSessionToken(e.newValue);
      if (e.key === "userSessions") {
        try {
          setUserSessions(JSON.parse(e.newValue) || {});
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 🔹 Utilisateur courant
  const currentUser =
    activeSessionToken && userSessions[activeSessionToken]
      ? { ...userSessions[activeSessionToken].user, token: userSessions[activeSessionToken].token }
      : null;

  // 🔹 Headers avec JWT
  const getAuthHeaders = () => {
    const session = activeSessionToken && userSessions[activeSessionToken];
    return {
      Authorization: session ? `Bearer ${session.token}` : "",
      "Content-Type": "application/json",
    };
  };

  // 🔹 Timer de session
 // 🔹 Timer de session (modifié)
const startSessionTimer = () => {
  clearSessionTimers();

  const session = activeSessionToken && userSessions[activeSessionToken];
  if (!session || !session.expiresAt) return;

  const expiresDate = new Date(session.expiresAt);
  if (isNaN(expiresDate.getTime())) return;

  const expiresIn = expiresDate - new Date();
  const warningTime = expiresIn - 60 * 1000; // 1 minute avant l'expiration

  // 🔹 Warning modal
  if (warningTime > 0) {
    warningTimeout.current = setTimeout(() => {
      setShowSessionWarning(true);
      let c = 60;
      setCountdown(c);
      countdownInterval.current = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          logout(); // <-- logout automatique
          setShowSessionWarning(false);
          window.location.href = "/"; // <-- redirection automatique
        }
      }, 1000);
    }, warningTime);
  } else if (expiresIn <= 0) {
    // si la session est déjà expirée
    logout();
    window.location.href = "/";
  }

  // 🔹 Logout automatique
  if (expiresIn > 0) {
    logoutTimeout.current = setTimeout(() => {
      logout();
      window.location.href = "/";
    }, expiresIn);
  }
};

  const clearSessionTimers = () => {
    if (logoutTimeout.current) clearTimeout(logoutTimeout.current);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setShowSessionWarning(false);
  };

  // 🔹 Login
  const login = (userData, token, sessionToken, expiresAt) => {
    if (!sessionToken) {
      toast.error("Erreur session.");
      return;
    }

    const newUser = { ...userData, sessionToken };

    setUserSessions(prev => {
      const updated = {
        ...prev,
        [sessionToken]: { user: newUser, token, expiresAt },
      };
      localStorage.setItem("userSessions", JSON.stringify(updated));
      return updated;
    });

    setActiveSessionToken(sessionToken);
    localStorage.setItem("activeSessionToken", sessionToken);

    startSessionTimer();
  };

  // 🔹 Logout
  const logout = (sessionToken = activeSessionToken) => {
    clearSessionTimers();

    setUserSessions(prev => {
      const updated = { ...prev };
      delete updated[sessionToken];
      localStorage.setItem("userSessions", JSON.stringify(updated));
      return updated;
    });

    if (sessionToken === activeSessionToken) {
      setActiveSessionToken(null);
      localStorage.removeItem("activeSessionToken");
      window.location.href = "/";
    }
  };

  // 🔹 Switch session
  const switchSession = token => {
    if (userSessions[token]) {
      setActiveSessionToken(token);
      localStorage.setItem("activeSessionToken", token);
      startSessionTimer();
    }
  };

  // 🔹 Restaurer session au chargement ou changement
  useEffect(() => {
    if (activeSessionToken && userSessions[activeSessionToken]) {
      startSessionTimer();
    }
  }, [activeSessionToken, userSessions]);

  // 🔹 Login via API
  const loginHandler = async (role, emailOrUsername, password, navigate) => {
    try {
      const endpoint =
        role === "admin" ? "/admin/login" : "/user/login";

      const body =
        role === "admin"
          ? { email: emailOrUsername.trim(), password }
          : { username: emailOrUsername.trim(), password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Erreur de connexion");
        return null;
      }

      login(data.user, data.token, data.sessionToken, data.user.expiresAt);
      navigate(role === "admin" ? "/administrator" : "/");
      return data.user;
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur");
      return null;
    }
  };

  // 🔹 Abonnement actif
  const isSubscriptionActive = () => {
    if (!currentUser || !currentUser.subscriptionDetails) return false;
    const sub = currentUser.subscriptionDetails;
    if (!sub.active || sub.suspended) return false;
    const now = new Date();
    return now >= new Date(sub.subscriptionStart) && now <= new Date(sub.subscriptionEnd);
  };

  // 🔹 Fonctionnalité selon plan
  const hasFeature = (key, options = {}) => {
    if (!currentUser) return false;
    if (!isSubscriptionActive()) {
      if (options.toastMessage !== false)
        toast.error("🚫 Aucun abonnement actif. Souscrivez à un plan.");
      return false;
    }

    const plan = currentUser.subscriptionDetails?.subscriptionType?.toLowerCase() || "gratuit";
    const limit = SUBSCRIPTION_LIMITS[plan]?.[key];

    if (limit === undefined) return false;

    if (typeof limit === "boolean") {
      if (!limit && options.toastMessage !== false)
        toast.error(`🔒 Fonction non disponible dans le plan ${plan.toUpperCase()}.`);
      return limit;
    }

    if (typeof limit === "number") {
      if (options.currentCount !== undefined && options.currentCount >= limit) {
        if (options.toastMessage !== false)
          toast.error(`🚫 Limite atteinte : max ${limit} ${key}.`);
        return false;
      }
    }

    return true;
  };

  return (
    <UserContext.Provider
      value={{
        user: currentUser,
        login,
        logout,
        loginHandler,
        showSessionWarning,
        countdown,
        activeSessionToken,
        switchSession,
        allSessions: userSessions,
        getAuthHeaders,
        hasFeature,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);