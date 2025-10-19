import React, { useState } from "react";
import { toast } from "react-toastify";

export default function ContractModal({ personId, adminId, homeId, onClose, onContractSaved }) {
  const [form, setForm] = useState({ startDate: "", endDate: "", paymentFrequency: "mensuel" });
  const [loading, setLoading] = useState(false);

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - startDate.getMonth());
    return months > 0 ? months : 0;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return toast.error("Veuillez remplir toutes les informations du contrat.");
    if (new Date(form.endDate) <= new Date(form.startDate)) return toast.error("La date de fin doit être après la date de début.");

    const durationMonths = calculateDuration(form.startDate, form.endDate);

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/contracts/add/${personId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adminId, homeId, durationMonths })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");

      toast.success("Contrat de bail enregistré !");
      onContractSaved(data);
      onClose();
      setForm({ startDate: "", endDate: "", paymentFrequency: "mensuel" });
    } catch (error) {
      console.error(error);
      toast.error("Impossible d’enregistrer le contrat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contract-modal-overlay">
        <div className="contract-modal">
          <button onClick={onClose} className="contract-close-btn">✕</button>
          <h3>Ajouter le contrat de bail</h3>
          <form className="contract-form" onSubmit={handleSubmit}>
            <label>Date de début</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />

            <label>Date de fin</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />

            {form.startDate && form.endDate && (
              <p>Durée : {calculateDuration(form.startDate, form.endDate)} mois</p>
            )}

            <label>Fréquence de paiement</label>
            <select name="paymentFrequency" value={form.paymentFrequency} onChange={handleChange}>
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="annuel">Annuel</option>
            </select>

            <div className="contract-modal-footer">
              <button type="button" onClick={onClose} className="btn-cancel">Annuler</button>
              <button type="submit" className="btn-save" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
            </div>
          </form>
        </div>
      </div>

      <style jsx="true">{`
        .contract-modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(17, 24, 39, 0.65);
          display: flex; justify-content: center; align-items: center;
          z-index: 2000; backdrop-filter: blur(2px);
        }

        .contract-modal {
          background: #ffffff;
          width: 95%; max-width: 500px;
          border-radius: 12px;
          padding: 25px 30px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          animation: fadeInScale 0.25s ease;
          position: relative;
        }

        .contract-modal h3 {
          font-size: 1.3rem;
          color: #111827;
          font-weight: 600;
          text-align: center;
          margin-bottom: 20px;
        }

        .contract-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .contract-form label {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 500;
        }

        .contract-form input,
        .contract-form select {
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          outline: none;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .contract-form input:focus,
        .contract-form select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }

        .contract-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 25px;
        }

        .btn-cancel {
          background: #e5e7eb;
          color: #111827;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-cancel:hover { background: #d1d5db; }

        .btn-save {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-save:hover { background: #1e40af; }

        .contract-close-btn {
          position: absolute; top: 10px; right: 15px;
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.2s ease;
        }
        .contract-close-btn:hover { color: #111827; }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}