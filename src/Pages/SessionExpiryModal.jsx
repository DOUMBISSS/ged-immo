// src/components/SessionExpiryModal.jsx
import React from "react";

const SessionExpiryModal = ({ countdown, onLogout }) => {
  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Attention !</h2>
          <p>Votre session va expirer dans <strong>{countdown}</strong> secondes.</p>
          <div className="modal-buttons">
            <button className="btn-logout" onClick={onLogout}>
              Se déconnecter maintenant
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-content {
          background: #fff;
          padding: 2rem;
          border-radius: 10px;
          text-align: center;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: fadeIn 0.3s ease-in-out;
        }

        .modal-content h2 {
          margin-bottom: 1rem;
          color: #d9534f;
        }

        .modal-content p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .modal-buttons {
          display: flex;
          justify-content: center;
        }

        .btn-logout {
          padding: 0.7rem 1.5rem;
          background: #d9534f;
          color: white;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-logout:hover {
          background: #c9302c;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default SessionExpiryModal;