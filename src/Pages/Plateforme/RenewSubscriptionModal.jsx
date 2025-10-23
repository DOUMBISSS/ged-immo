import React, { useState } from "react";
import { toast } from "react-toastify";

export default function RenewSubscriptionModal({ isOpen, onClose, admin, onRenew }) {
  const [loading, setLoading] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState(admin.subscriptionType || "mensuel");
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen) return null;
const handleRenew = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("gedToken");

    const res = await fetch(`http://localhost:4000/ged/admin/${admin._id}/renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscriptionType }),
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Erreur lors de l'ajout de l'abonnement");

    toast.success(`Nouvel abonnement ${subscriptionType} ajouté avec succès ✅`);

    onRenew(data.subscription.subscriptionEnd); // Mettre à jour la date
    onClose();

    // 🔄 Recharge la page après un petit délai (pour laisser le toast s'afficher)
    setTimeout(() => {
      window.location.reload();
    }, 1200);
    
  } catch (err) {
    toast.error("Erreur serveur : " + err.message);
  } finally {
    setLoading(false);
  }
};
  const handleSuspend = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("gedToken");

      const res = await fetch(`http://localhost:4000/ged/admin/${admin._id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ suspend: !admin.suspended }), // toggle suspend
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Erreur lors de la mise à jour de l'abonnement");

      toast.success(
        `Abonnement de ${admin.fullname} ${data.subscription.suspended ? "suspendu" : "réactivé"} ✅`
      );
      onRenew(data.subscription.subscriptionEnd); // garder la date de fin inchangée
      onClose();
      // 🔄 Recharge la page après un petit délai (pour laisser le toast s'afficher)
    setTimeout(() => {
      window.location.reload();
    }, 1200);
    } catch (err) {
      toast.error("Erreur serveur : " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="modal-overlay--subscription">
      <div className="modal-container--subscription">
        <h2>Gérer l'abonnement</h2>
        <p>
          Administrateur : <strong>{admin.fullname}</strong>
        </p>

        <label>
          Type d’abonnement :
          <select
            value={subscriptionType}
            onChange={(e) => setSubscriptionType(e.target.value)}
          >
            <option value="mensuel">Mensuel (30 jours)</option>
            <option value="annuel">Annuel (1 an)</option>
            <option value="premium">Premium (2 ans)</option>
            <option value="test">Test</option>
          </select>
        </label>

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading || actionLoading}>
            Annuler
          </button>
          <button onClick={handleRenew} disabled={loading}>
            {loading ? "Chargement..." : "Renouveler"}
          </button>
          <button onClick={handleSuspend} disabled={actionLoading}>
            {actionLoading
              ? "Chargement..."
              : admin.suspended
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
        .modal-actions button:first-child {
          background: #e5e7eb;
        }
        .modal-actions button:nth-child(2) {
          background: #2563eb;
          color: white;
        }
        .modal-actions button:last-child {
          background: #f87171;
          color: white;
        }
      `}</style>
    </div>
  );
}