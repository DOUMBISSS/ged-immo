import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "../contexts/UserContext";

// 🔹 Composant Icône simple
const Icon = ({ emoji }) => (
  <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "10px" }}>
    {emoji}
  </span>
);

// 🔹 Composant PlanCard
const PlanCard = ({ plan, onSubscribe }) => (
  <div className="plan-card">
    <div className="plan-icon">{plan.icon}</div>
    <h2 className="plan-name">{plan.nom}</h2>
    <p className="plan-type">{plan.type}</p>
    <p className="plan-price">{plan.prix}</p>
    <p className="plan-description">{plan.description}</p>
    <ul className="plan-limits">
      {plan.limites.map((limite, idx) => (
        <li key={idx}>{limite}</li>
      ))}
    </ul>
    <button className="plan-button" onClick={() => onSubscribe(plan)}>
      Souscrire
    </button>
  </div>
);

// 🔹 Données des abonnements
const abonnements = [
  {
    nom: "Abonnement Gratuit",
    planKey: "gratuit",
    type: "Free / Basic",
    icon: <Icon emoji="🏠" />,
    prix: "0 FCFA / 3 mois",
    description: "Découvrez la plateforme GED IMMO avec des fonctionnalités limitées.",
    limites: [
      "Accès limité aux documents et projets",
      "Pas d’export CSV/PDF",
      "1 document par locataire",
      "3 projets maximum",
      "Taille max d’un fichier : 5 Mo",
      "Pas d’historique ni traçabilité",
      "Pas de comptes locataires",
      "Pas d’accès aux archives",
      "1 signature électronique",
      "1 utilisateur",
      "Suppression automatique après 180 jours",
    ],
  },
  {
    nom: "Abonnement Standard",
    planKey: "standard",
    type: "Pro / Standard",
    icon: <Icon emoji="🏢" />,
    prix: "60 000 FCFA / 6 mois",
    description: "Idéal pour les petites agences ou propriétaires avec des fonctions avancées.",
    limites: [
      "10 projets max",
      "10 utilisateurs",
      "Traçabilité et archives incluses",
      "Comptes locataires disponibles",
      "3 signatures électroniques",
      "Export CSV/PDF autorisé",
      "Support email + chat",
      "Taille max d’un fichier : 25 Mo",
    ],
  },
  {
    nom: "Abonnement Premium",
    planKey: "premium",
    type: "Entreprise / Premium",
    icon: <Icon emoji="👑" />,
    prix: "100 000 FCFA / an",
    description: "La solution complète pour les entreprises et gestionnaires immobiliers.",
    limites: [
      "Projets & documents illimités",
      "Utilisateurs illimités",
      "10 Signatures électroniques illimitées",
      "Traçabilité et archives incluses",
      "Gestion complète des rôles",
      "Support premium & prioritaire",
      "Fichiers jusqu’à 25 Mo",
      "Collaboration en temps réel",
      "Notifications et dashboards avancés",
    ],
  },
];

export default function PlansTarifs({ isOpen, onClose }) {
  const { user } = useUserContext();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  if (!isOpen) return null;

  // 🔹 Sélection d’un plan
  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setConfirmModal(true);
  };

const confirmSubscription = async () => {
  if (!selectedPlan) return toast.error("Aucun plan sélectionné");

  try {
    const res = await fetch(`http://localhost:4000/send/notifications/${user._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        adminId: user._id,
        type: "demande_abonnement",
        message: `L'utilisateur souhaite souscrire au plan : ${selectedPlan.nom}`,
        plan: selectedPlan.planKey,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // 💡 Afficher le message renvoyé par le backend
      toast.error(data.message || "❌ Erreur serveur");
      return; // le modal reste ouvert
    }

    toast.success(`✅ Demande de souscription à "${selectedPlan.nom}" envoyée avec succès`);
    setConfirmModal(false);
    onClose();
  } catch (err) {
    console.error("Erreur envoi notification :", err);
    toast.error("❌ Erreur lors de l’envoi de la demande");
  }
};

  return (
    <div className="overlay" onClick={onClose}>
      <div className="plans-modal" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>✕</span>
        <h1 className="modal-title">Nos Plans & Tarifs</h1>

        <div className="plans-grid">
          {abonnements.map((plan, idx) => (
            <PlanCard key={idx} plan={plan} onSubscribe={handleSubscribe} />
          ))}
        </div>

        {/* 🔹 Modal de confirmation */}
        {confirmModal && selectedPlan && (
          <div className="confirm-overlay" onClick={() => setConfirmModal(false)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Confirmer la souscription</h2>
              <p>
                Vous êtes sur le point de souscrire au plan{" "}
                <strong>{selectedPlan.nom}</strong>.
              </p>
              <div className="confirm-actions">
                <button className="btn-cancel" onClick={() => setConfirmModal(false)}>Annuler</button>
                <button className="btn-confirm" onClick={confirmSubscription}>Confirmer</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Styles modernes SaaS */}
      <style jsx>{`
        .overlay {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .plans-modal {
          background: #fff;
          border-radius: 16px;
          padding: 30px;
          width: 95%; max-width: 1200px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .close-button {
          position: absolute; top: 15px; right: 20px;
          cursor: pointer; font-size: 24px;
          font-weight: bold; color: #444;
          transition: color 0.2s;
        }
        .close-button:hover { color: #007bff; }
        .modal-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 30px;
        }
        .plans-grid {
          display: flex; gap: 20px;
          flex-wrap: wrap; justify-content: center;
        }
        .plan-card {
          flex: 1 1 320px;
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }
        .plan-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .plan-icon { margin-bottom: 10px; }
        .plan-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 5px;
        }
        .plan-type {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }
        .plan-price {
          color: #007bff;
          font-weight: 600;
          font-size: 1.2rem;
          margin-bottom: 10px;
        }
        .plan-description {
          color: #555;
          font-size: 0.95rem;
          margin-bottom: 10px;
        }
        .plan-limits {
          text-align: left;
          margin-bottom: 15px;
          font-size: 0.9rem;
          color: #333;
        }
        .plan-limits li { margin-bottom: 4px; }
        .plan-button {
          background: #007bff;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .plan-button:hover { background: #0056b3; }

        /* Modal confirmation */
        .confirm-overlay {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.4);
          display: flex; justify-content: center; align-items: center;
          z-index: 1100;
        }
        .confirm-modal {
          background: #fff;
          border-radius: 12px;
          padding: 25px;
          width: 90%; max-width: 400px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .confirm-actions {
          display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;
        }
        .btn-cancel, .btn-confirm {
          padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;
        }
        .btn-cancel {
          background: #ccc; color: #000;
        }
        .btn-cancel:hover { background: #aaa; }
        .btn-confirm {
          background: #007bff; color: #fff;
        }
        .btn-confirm:hover { background: #0056b3; }
      `}</style>
    </div>
  );
}