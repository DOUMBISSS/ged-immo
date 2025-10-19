import React, { useState } from "react";
import { toast } from "react-toastify";

const API = "http://localhost:4000"; // adapte selon ton backend

export default function UploadSignature({ adminId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    } else {
      toast.error("Veuillez sélectionner une image valide (PNG, JPG).");
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Veuillez choisir une signature d’abord !");
    setLoading(true);

    const formData = new FormData();
    formData.append("signature", file);

    try {
      const res = await fetch(`${API}/admin/${adminId}/upload-signature`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Signature enregistrée !");
        setSignatureUrl(data.signature);
      } else {
        toast.error(data.message || "Erreur lors de l’upload");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3>📌 Uploader votre signature électronique</h3>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div style={styles.previewContainer}>
          <p>Aperçu :</p>
          <img src={preview} alt="Prévisualisation" style={styles.preview} />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Envoi..." : "Enregistrer signature"}
      </button>

      {signatureUrl && (
        <div style={{ marginTop: "1rem" }}>
          <p>✅ Signature enregistrée :</p>
          <img src={signatureUrl} alt="Signature enregistrée" style={styles.preview} />
        </div>
      )}
    </div>
  );
}

// 🎨 CSS inline simple
const styles = {
  container: {
    maxWidth: "400px",
    margin: "2rem auto",
    padding: "1.5rem",
    border: "1px solid #ddd",
    borderRadius: "10px",
    textAlign: "center",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  previewContainer: {
    margin: "1rem 0",
  },
  preview: {
    maxWidth: "100%",
    maxHeight: "150px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    marginTop: "1rem",
    padding: "0.7rem 1.5rem",
    background: "#4b00cc",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};