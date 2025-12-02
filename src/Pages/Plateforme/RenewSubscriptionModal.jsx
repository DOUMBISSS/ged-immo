import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function RenewSubscriptionModal({ isOpen, onClose, admin, onRenew }) {
  const [loading, setLoading] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState(admin.subscriptionType || "mensuel");
  const [suspendBtnLoading, setSuspendBtnLoading] = useState(false);
  const [suspended, setSuspended] = useState(admin.suspended || false);

  // Mettre à jour le type d'abonnement si admin change
  useEffect(() => {
    setSubscriptionType(admin.subscriptionType || "gratuit");
    setSuspended(admin.suspended || false);
  }, [admin]);

  if (!isOpen) return null;

  // 🔹 Renouveler l'abonnement
const handleRenew = async () => {
  try {
    setLoading(true);

    if (!admin || !admin._id) {
      return toast.error("Admin non défini ou ID manquant.");
    }

    const token = localStorage.getItem("gedToken");
    if (!token) return toast.error("Token manquant, reconnectez-vous.");

    const allowedTypes = ["gratuit", "standard", "premium", "test"];
    if (!subscriptionType || !allowedTypes.includes(subscriptionType)) {
      return toast.error(`Type d'abonnement invalide : "${subscriptionType}"`);
    }

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}/ged/admin/${admin._id}/renew`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionType }),
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      return toast.error(data?.message || "Erreur serveur lors du renouvellement.");
    }

    // 🔹 Toast spécifique pour abonnement programmé
    if (data.subscription.scheduledStart) {
      const scheduledDate = new Date(data.subscription.scheduledStart).toLocaleDateString("fr-FR");
      toast(`🕒 Abonnement "${subscriptionType}" programmé pour le ${scheduledDate}`, { icon: '⏳' });
    } else {
      const endDate = new Date(data.subscription.subscriptionEnd).toLocaleDateString("fr-FR");
      toast.success(`✅ Abonnement "${subscriptionType}" renouvelé jusqu'au ${endDate}`);
    }

    // Callback éventuel pour mise à jour parent
    if (typeof onRenew === "function") onRenew(data.subscription);
    if (typeof onClose === "function") onClose();

    // Recharge la page pour actualiser les données
    setTimeout(() => window.location.reload(), 500);

  } catch (err) {
    console.error("Erreur handleRenew :", err);
    toast.error("Erreur inattendue : " + err.message);
  } finally {
    setLoading(false);
  }
};

  // 🔹 Suspendre / Réactiver l'abonnement
  const handleSuspend = async () => {
    try {
      setSuspendBtnLoading(true);

      const token = localStorage.getItem("gedToken");
      if (!token) return toast.error("Token manquant, reconnectez-vous.");

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}/ged/admin/${admin._id}/suspend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.subscription) {
        return toast.error(data?.message || "Erreur lors de la mise à jour de l'abonnement");
      }

      const newStatus = data.subscription.suspended;
      setSuspended(newStatus);
      toast.success(`Abonnement de ${admin.fullname} ${newStatus ? "suspendu" : "réactivé"} ✅`);

      if (data.subscription.subscriptionEnd) {
        onRenew(data.subscription.subscriptionEnd);
      }

      // 🔹 Recharge la page après suspension / réactivation
      setTimeout(() => window.location.reload(), 500);

    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur : " + (err.message || err));
    } finally {
      setSuspendBtnLoading(false);
    }
  };

  return (
    <div className="modal-overlay--subscription">
      <div className="modal-container--subscription">
        <h2>Gérer l'abonnement</h2>
        <p>Administrateur : <strong>{admin.fullname}</strong></p>

        <label>
          Type d’abonnement :
          <select value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value)}>
            <option value="gratuit">Gratuit (3 mois)</option>
            <option value="standard">Standard (6 mois)</option>
            <option value="premium">Premium (1 an)</option>
            <option value="test">Test</option>
          </select>
        </label>

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading || suspendBtnLoading}>Annuler</button>
          <button onClick={handleRenew} disabled={loading}>
            {loading ? "Chargement..." : "Renouveler"}
          </button>
          <button onClick={handleSuspend} disabled={suspendBtnLoading}>
            {suspendBtnLoading
              ? "Chargement..."
              : suspended
                ? "Réactiver l’abonnement"
                : "Suspendre l’abonnement"}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay--subscription {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }
        .modal-container--subscription {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          width: 400px;
          max-width: 90%;
        }
        select {
          margin-left: 10px;
          padding: 0.4rem;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .modal-actions button {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }
        .modal-actions button:first-child { background: #e5e7eb; }
        .modal-actions button:nth-child(2) { background: #2563eb; color: white; }
        .modal-actions button:last-child { background: #f87171; color: white; }
      `}</style>
    </div>
  );
}