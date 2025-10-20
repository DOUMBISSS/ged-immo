import React from "react";


export default function PermissionModal({ show, onClose, title, message }) {
  if (!show) return null;

  return (
    <div className="permission-modal-overlay" onClick={onClose}>
      <div
        className="permission-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>🚫 {title || "Permission refusée"}</h2>
        <p>{message || "Vous n'avez pas la permission nécessaire pour accéder à cette section."}</p>

        <button
          onClick={onClose}
          className="btn btn-danger w-100 mt-3"
        >
          <i className="fa-solid fa-xmark me-2"></i> Fermer
        </button>
      </div>
        <style jsx="true">{`
       .permission-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.permission-modal {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 6px 25px rgba(0,0,0,0.25);
  animation: fadeInUp 0.3s ease-out;
}

.permission-modal h2 {
  margin-bottom: 1rem;
}

.permission-modal p {
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
      `}</style>
    </div>
  );
}