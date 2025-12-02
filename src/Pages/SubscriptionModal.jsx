import React, { useState } from "react";

export default function SubscriptionModal() {
  const [subscriptionType, setSubscriptionType] = useState("gratuit");
  const [showModal, setShowModal] = useState(false);

  const subscriptionDetails = {
    gratuit: {
      title: "Gratuit — 3 mois d’essai 🆓",
      description: [
        "Accès limité aux fonctionnalités de base",
        "Nombre limité de projets ou documents",
        "Support standard par email"
      ]
    },
    standard: {
      title: "Standard — 60 000 FCFA / 6 mois 📅",
      description: [
        "Accès aux fonctionnalités principales",
        "Rapports et statistiques",
        "Support prioritaire par email"
      ]
    },
    premium: {
      title: "Premium — 100 000 FCFA / an 💎",
      description: [
        "Accès complet à toutes les fonctionnalités GED IMMO",
        "Gestion illimitée de projets et documents",
        "Support premium par email et téléphone",
        "Accès aux fonctionnalités avancées (export, analytics, notifications)"
      ]
    }
  };

  const handleSelectChange = (e) => {
    setSubscriptionType(e.target.value);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      {/* Bouton pour ouvrir le modal */}
      <button
        style={{
          marginBottom: 15,
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#3498db",
          color: "#fff",
          cursor: "pointer"
        }}
        onClick={() => setShowModal(true)}
      >
        Choisir un abonnement
      </button>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "15px",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center"
            }}
          >
            <h2>💎 Sélection de votre abonnement</h2>

            {/* Select abonnement */}
            <select
              value={subscriptionType}
              onChange={handleSelectChange}
              style={{
                margin: "15px 0",
                padding: "10px",
                width: "100%",
                borderRadius: 8
              }}
            >
              <option value="gratuit">Gratuit — 3 mois d’essai</option>
              <option value="standard">Standard — 60 000 FCFA / 6 mois</option>
              <option value="premium">Premium — 100 000 FCFA / an</option>
            </select>

            {/* Détails abonnement */}
            <div style={{ textAlign: "left", marginTop: 10 }}>
              <h3>{subscriptionDetails[subscriptionType].title}</h3>
              <ul>
                {subscriptionDetails[subscriptionType].description.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Bouton valider */}
            <button
              style={{
                marginTop: 20,
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#3498db",
                color: "#fff",
                cursor: "pointer"
              }}
              onClick={handleCloseModal}
            >
              Valider l’abonnement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}