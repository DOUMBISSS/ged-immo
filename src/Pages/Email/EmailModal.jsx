import { useState } from "react";
import toast from "react-hot-toast";
import { useUserContext } from "../../contexts/UserContext";


const API = "http://localhost:4000"; // ou ton URL de backend

export default function EmailModal({ isOpen, onClose, rentId }) {

    const { user } = useUserContext();

  const [email, setEmail] = useState(""); // email du destinataire

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    const token = localStorage.getItem('token');
if (!token) {
  console.error("Token manquant !");
  return;
}

    try {
      const res = await fetch(`${API}/send-receipt-email/${rentId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // ✅ Le token JWT doit être envoyé pour authentifier l'admin
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ recipient: email }) // seulement le destinataire
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de l'envoi de l'email");
      }

      toast.success("Reçu envoyé par email ✅");
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-mail">
      <div className="modal-mail">
        <h2>Envoyer le reçu</h2>
        <p>Saisis l’adresse email du destinataire :</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemple@mail.com"
          className="modal-input"
        />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-send" onClick={handleSendEmail}>
            <i className="fa-solid fa-envelope"></i> Envoyer
          </button>
          
        </div>
      </div>

      <style>{`
        .modal-overlay-mail { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-mail { background:#fff; padding:2rem; border-radius:10px; max-width:400px; width:100%; box-shadow:0 5px 15px rgba(0,0,0,0.2); text-align:center; animation: fadeIn 0.3s ease; }
        .modal-mail h2 { margin-bottom:1rem; color:#333; }
        .modal-input { width:100%; padding:0.6rem; margin:1rem 0; border:1px solid #ccc; border-radius:6px; font-size:1rem; }
        .modal-actions { display:flex; justify-content:flex-end; gap:1rem; }
        .btn-cancel, .btn-send { padding:0.6rem 1.2rem; border:none; border-radius:6px; cursor:pointer; font-weight:bold; }
        .btn-cancel { background:#bbb; color:#fff; }
        .btn-cancel:hover { background:#999; }
        .btn-send { background:#4b00cc; color:#fff; }
        .btn-send:hover { background:#35008f; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}