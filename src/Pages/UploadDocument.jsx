import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";
import { SUBSCRIPTION_LIMITS } from "../subscriptionLimits";

export default function UploadDocumentModal({ personId, onClose }) {
  const { user } = useUserContext();
  const planType = user?.subscriptionType?.toLowerCase() || "gratuit";
  const uploadLimit = SUBSCRIPTION_LIMITS[planType]?.uploadDocument || 1;

  const [documents, setDocuments] = useState({});
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // 🔹 Charger les documents existants du locataire
  const fetchDocuments = async () => {
    try {
      if (!user?.token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      const res = await fetch(`https://backend-ged-immo.onrender.com/locataire/${personId}/documents`, {
        headers: { "Authorization": `Bearer ${user.token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Impossible de récupérer les documents");
      setDocuments(data.documents || {});
    } catch (err) {
      toast.error("Erreur serveur : " + err.message);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [personId]);

  const currentType = type === "Autre" ? customType : type;
  const existingDoc = documents[currentType];

  // 🔹 Upload document avec vérification de la limite d’abonnement
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!customType.trim()) return toast.error("Veuillez entrer un titre pour le document !");
    if (!file) return toast.error("Veuillez sélectionner un fichier PDF !");
    if (!user?.token) return toast.error("Session expirée. Veuillez vous reconnecter.");

    // 🔸 Vérifier la limite d’abonnement (en frontend)
    const currentDocCount = Object.keys(documents).length;
    if (currentDocCount >= uploadLimit) {
      return toast.error(
        `🚫 Limite atteinte : votre plan ${planType.toUpperCase()} permet un maximum de ${uploadLimit} document(s) par locataire.`
      );
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", customType.trim());

    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/UploadDocument/${personId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const message =
          typeof data.message === "string"
            ? data.message
            : JSON.stringify(data.message);
        return toast.error("Erreur : " + message);
      }

      toast.success(data.message);
      setFile(null);
      setCustomType("");
      fetchDocuments();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || JSON.stringify(err);
      toast.error("Erreur serveur : " + message);
      console.error("Upload error:", err);
    }
  };

  // 🔹 Téléchargement
  const handleDownload = (filePath) => {
    const filename = filePath.split("/").pop();
    window.open(`https://backend-ged-immo.onrender.com/documents/${filename}/download`, "_blank");
  };

  // 🔹 Suppression
  const handleDelete = async (docId) => {
    toast(
      (t) => (
        <span>
          Voulez-vous vraiment supprimer ce document ?<br />
          <button
            className="btn-confirm"
            onClick={async () => {
              toast.dismiss(t.id);

              try {
                if (!user?.token) {
                  toast.error("Session expirée. Veuillez vous reconnecter.");
                  return;
                }

                const res = await fetch(`https://backend-ged-immo.onrender.com/Document/${docId}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${user.token}` },
                });

                const data = await res.json();
                if (!data.success) return toast.error(data.message);

                toast.success(data.message);
                fetchDocuments();
              } catch (err) {
                toast.error("Erreur serveur : " + err.message);
              }
            }}
          >
            Oui
          </button>
          <button className="btn-cancel" onClick={() => toast.dismiss(t.id)}>Annuler</button>
        </span>
      ),
      { duration: 10000 }
    );
  };

  // 🔹 Drag & Drop
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-doc">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>📄 Documents du locataire</h2>

        {/* 🔹 Info sur le plan et la limite */}
        <p style={{ fontSize: "14px", color: "#555" }}>
          Plan actuel : <strong>{planType.toUpperCase()}</strong> — Limite :{" "}
          <strong>{uploadLimit}</strong> document(s)
        </p>

        {/* Champ libre pour nom du document */}
        <input
          type="text"
          placeholder="Entrez le nom du document"
          value={customType}
          onChange={(e) => setCustomType(e.target.value)}
          className="input__custom"
          required
        />

        <div
          className={`upload-zone ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Glissez-déposez un fichier PDF ici ou cliquez pour sélectionner</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && <p className="selected-file">📂 {file.name}</p>}
        </div>

        <button className="btn__sub" onClick={handleUpload}>
          {existingDoc ? "Remplacer" : "Ajouter"}
        </button>

        {existingDoc && (
          <button className="btn__delete" onClick={() => handleDelete(existingDoc._id)}>
            Supprimer le document existant
          </button>
        )}

        <ul className="doc-list">
          {Object.keys(documents).length === 0 && <li>Aucun document</li>}
          {Object.entries(documents).map(([key, doc]) =>
            doc ? (
              <li key={doc._id}>
                {doc.type} :{" "}
                {(() => {
                  const filename = doc.filePath.split("/").pop();
                  return filename.toLowerCase().endsWith(".pdf")
                    ? filename
                    : `${filename}.pdf`;
                })()}
                <button
                  className="btn-download"
                  onClick={() => handleDownload(doc.filePath)}
                >
                  ⬇️ Télécharger
                </button>
                <button
                  className="btn__sup"
                  onClick={() => handleDelete(doc._id)}
                >
                  Supprimer
                </button>
              </li>
            ) : null
          )}
        </ul>
      </div>
      <Toaster position="top-right" reverseOrder={false} />

      {/* 🔹 CSS inline (inchangé) */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(17, 24, 39, 0.75);
          display: flex; justify-content: center; align-items: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }
        .modal-content-doc {
          background: #fff;
          border-radius: 16px;
          padding: 30px;
          width: 650px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0px 10px 30px rgba(0,0,0,0.2);
          position: relative;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .close-btn {
          position: absolute;
          top: 15px; right: 15px;
          background: none; border: none;
          font-size: 20px; cursor: pointer; color: #6b7280;
        }
        .upload-zone {
          border: 2px dashed #2563eb;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 20px 0;
          background: #f9fafb;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .upload-zone.drag-active {
          background: #e0f2fe;
          border-color: #0284c7;
        }
        .selected-file {
          margin-top: 10px;
          color: #2563eb;
          font-weight: 600;
        }
        .doc-list {
          list-style: none;
          padding: 0;
        }
        .doc-list li {
          display: flex; justify-content: space-between; align-items: center;
          background: #f8fafc;
          padding: 10px; border-radius: 8px;
          margin-bottom: 10px;
        }
        .btn__sub {
          background: #2563eb;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          margin-top: 10px;
          font-weight: bold;
        }
        .btn__delete {
          background: #ef4444;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }
        .btn-download {
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          cursor: pointer;
          margin-right:0.7rem;
          width:200px
        }
      `}</style>
    </div>
  );
}