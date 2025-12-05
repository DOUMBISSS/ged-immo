import { useState } from "react";

export default function IncreaseHistoryModal({
  homeId,
  history = [],
  onClose,
  onRentUpdated
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [percentage, setPercentage] = useState("");

  const [manualRent, setManualRent] = useState("");
  const [showManualConfirm, setShowManualConfirm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = "http://localhost:4000";

  const ITEMS_PER_PAGE = 5;

  // ===== PAGINATION =====
  const sortedHistory = history
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.ceil(sortedHistory.length / ITEMS_PER_PAGE);

  const paginatedHistory = sortedHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ===== ACTION : AUGMENTATION % =====
  const handleIncreaseRent = async () => {
    try {
      const response = await fetch(`${API_URL}/homes/${homeId}/increase-rent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ percentage: Number(percentage) }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Erreur : " + data.message);
        return;
      }

      onRentUpdated(data.updatedHome);
      setShowConfirm(false);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  // ===== ACTION : MODIFICATION MANUELLE =====
  const handleManualUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/homes/${homeId}/update-rent-manual`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newRent: Number(manualRent),
          reason: "Ajustement manuel depuis modal"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Erreur : " + data.message);
        return;
      }

      onRentUpdated(data.updatedHome);
      setShowManualConfirm(false);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  return (
    <div className="modal-overlay-history" onClick={onClose}>
      <div className="modal-box-history" onClick={(e) => e.stopPropagation()}>
        
        <h2>Gestion du loyer & Historique</h2>

        {/* ===== MODIFICATION MANUELLE ===== */}
        <div style={{ marginBottom: "1.5rem", marginTop: "1.5rem" }}>
          <label style={{ fontWeight: 600, marginRight: 10 }}>
            Modifier le loyer manuellement :
          </label>

          <input
            type="number"
            min="1"
            value={manualRent}
            onChange={(e) => setManualRent(e.target.value)}
            placeholder="Ex : 250000"
            className="percentage-input"
          />

          <button
            className="btn-increase"
            style={{ marginLeft: "10px", background: "#6D28D9" }}
            disabled={!manualRent}
            onClick={() => setShowManualConfirm(true)}
          >
            Modifier
          </button>
        </div>

        {/* ===== AUGMENTATION % ===== */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontWeight: 600, marginRight: 10 }}>Augmenter en (%) :</label>

          <input
            type="number"
            min="-30"
            max="30"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Ex : 10"
            className="percentage-input"
          />

          <button
            className="btn-increase"
            disabled={!percentage}
            onClick={() => setShowConfirm(true)}
            style={{ marginLeft: "10px" }}
          >
            + Augmenter
          </button>
        </div>

        {/* ===== TABLEAU HISTORIQUE ===== */}
        {history.length === 0 ? (
          <p>Aucune augmentation enregistrée.</p>
        ) : (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Loyer précédent</th>
                  <th>Nouveau loyer</th>
                  <th>%</th>
                  <th>Décidé par</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
                    <td>{entry.oldRent?.toLocaleString("fr-FR")} FCFA</td>
                    <td>{entry.newRent?.toLocaleString("fr-FR")} FCFA</td>
                    <td>{entry.percentage}%</td>
                    <td>{entry.decidedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ===== PAGINATION ===== */}
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                ◀ Précédent
              </button>

              <span style={{ fontWeight: 600 }}>
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant ▶
              </button>
            </div>
          </>
        )}

        <button className="modal-close-btn" onClick={onClose} style={{ marginTop: "1rem" }}>
          Fermer
        </button>

        {/* ===== CONFIRMATION POURCENTAGE ===== */}
        {showConfirm && (
          <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
              <p>
                Confirmer l’augmentation de <strong>{percentage}%</strong> ?
              </p>
              <div className="confirm-actions">
                <button onClick={handleIncreaseRent}>Oui</button>
                <button onClick={() => setShowConfirm(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== CONFIRMATION MODIFICATION MANUELLE ===== */}
        {showManualConfirm && (
          <div className="confirm-overlay" onClick={() => setShowManualConfirm(false)}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
              <p>
                Modifier le loyer à <strong>{manualRent} FCFA</strong> ?
              </p>
              <div className="confirm-actions">
                <button onClick={handleManualUpdate} className="btn-increase">Oui</button>
                <button onClick={() => setShowManualConfirm(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

      </div>
       <style>{`
    
        .btn-increase {
  background: #3498db;
  border: none;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
  .percentage-input {
  width: 200px;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}



      `}</style>
    </div>
  );
}