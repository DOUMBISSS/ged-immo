import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PermissionModal({ visible, message, onClose, type = "error" }) {
  const closeButtonRef = useRef(null);

  // Focus automatique sur le bouton "Fermer"
  useEffect(() => {
    if (visible && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [visible]);

  // Couleur de l'icône selon le type de message
  const iconColors = {
    error: "bg-red-100 text-red-600",
    warning: "bg-yellow-100 text-yellow-600",
    info: "bg-blue-100 text-blue-600",
  };
  const iconClass = iconColors[type] || iconColors.error;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // clic sur le fond ferme le modal
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-[90%] relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            onClick={(e) => e.stopPropagation()} // empêche la fermeture si on clique sur le contenu
          >
            {/* Bouton fermeture */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            >
              &times;
            </button>

            {/* En-tête */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${iconClass}`}>
                <i className="fa-solid fa-lock text-lg"></i>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {type === "error" ? "Accès refusé" : type === "warning" ? "Attention" : "Information"}
              </h2>
            </div>

            {/* Message principal */}
            <p className="text-gray-600 leading-relaxed mb-3">
              Vous n’avez pas la permission nécessaire pour effectuer cette action.
            </p>

            {/* Détails optionnels */}
            {message && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-3">
                <strong>Détails :</strong>
                <p>{message}</p>
              </div>
            )}

            {/* Bouton fermer */}
            <div className="text-right">
              <button
                onClick={onClose}
                className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400`}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}