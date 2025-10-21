import { useEffect, useState, useRef } from "react";
import { useUserContext } from "../contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API = "http://localhost:4000";

export default function Profil() {
  const { user } = useUserContext();
  const [adminData, setAdminData] = useState(null);
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [roleType, setRoleType] = useState(null); // admin ou user

  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const token = user?.token;

  // 🔹 États pour la mise à jour du profil
const [editModalOpen, setEditModalOpen] = useState(false);
const [editNumber, setEditNumber] = useState("");
const [editAddress, setEditAddress] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

// 🔹 Ouvrir le modal avec les valeurs actuelles
const openEditModal = () => {
  if (roleType !== "admin") {
    toast.error("Seul l’administrateur peut modifier son profil");
    return;
  }
  setEditNumber(adminData.number || "");
  setEditAddress(adminData.address || "");
  setEditModalOpen(true);
};

// 🔹 Enregistrer la mise à jour du profil
const handleUpdateProfile = async (e) => {
  e.preventDefault();

  if (password && password !== confirmPassword) {
    toast.error("Les mots de passe ne correspondent pas");
    return;
  }

  try {
    const res = await fetch(`${API}/admin/${user._id}/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        number: editNumber,
        address: editAddress,
        password: password || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");

    toast.success("Profil mis à jour avec succès ✅");
    setAdminData((prev) => ({
      ...prev,
      number: editNumber,
      address: editAddress,
    }));
    setEditModalOpen(false);
    setPassword("");
    setConfirmPassword("");
  } catch (err) {
    console.error("Erreur mise à jour profil:", err);
    toast.error(err.message || "Erreur serveur");
  }
};

  // 🟢 Charger les données liées à l'utilisateur connecté
  useEffect(() => {
    if (!user?._id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/account/${user._id}/linked-data`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Erreur de chargement");
          return;
        }

        setRoleType(data.type);

        if (data.type === "admin") {
          setAdminData(data.admin);
          setLinkedUsers(data.users || []);
        } else {
          setAdminData(data.admin);
        }
      } catch (err) {
        console.error("Erreur récupération profil :", err);
        toast.error("Erreur serveur");
      }
    };

    fetchData();
  }, [user]);

  // 🟢 Charger les signatures de l’admin
  useEffect(() => {
    const fetchSignatures = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`${API}/${user._id}/signatures`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger les signatures");
        const data = await res.json();
        const sigArray = Array.isArray(data.signatures) ? data.signatures : [];
        setSignatures(sigArray);
        setSelectedSignature(sigArray[0] || null);
      } catch (err) {
        console.error("Erreur fetchSignatures:", err);
      }
    };

    fetchSignatures();
  }, [user, token]);

  // 🎨 Gestion du dessin (signature)
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const handleResetCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 🧩 Enregistrer une signature (max 3)
  const handleSaveSignature = async () => {
    if (signatures.length >= 3) return toast.error("Vous ne pouvez enregistrer que 3 signatures maximum.");

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();
    const formData = new FormData();
    formData.append("signature", blob, "signature.png");

    try {
      const res = await fetch(`${API}/${user._id}/upload-signature`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement de la signature");
      const updated = await res.json();
      setSignatures(updated.signatures);
      setSelectedSignature(updated.signatures[updated.signatures.length - 1]);
      toast.success("Signature enregistrée ✅");
    } catch (err) {
      console.error("Erreur handleSaveSignature:", err);
      toast.error(err.message);
    }
  };

  // 🔹 Supprimer une signature
  const handleDeleteSignature = async (index) => {
    try {
      const res = await fetch(`${API}/${user._id}/signatures/${index}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur suppression signature");
      const data = await res.json();
      setSignatures(data.signatures);
      toast.success("Signature supprimée ✅");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 🔹 Sélectionner une signature
  const handleSelectSignature = async (sig) => {
    try {
      const res = await fetch(`${API}/admin/${user._id}/select-signature`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ signature: sig }),
      });
      if (!res.ok) throw new Error("Erreur sélection signature");
      setSelectedSignature(sig);
      toast.success("Signature sélectionnée ✅");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!adminData) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Chargement...</p>;

  return (
    <>
      <Navbar />
      <div className="profil-container">
        <Toaster position="top-right" />
        <h1>Mon Profil</h1>

        

        {/* Informations Admin */}
        <div className="profil-card">
          <div className="profil-info">
            {roleType === "admin" ? (
              <>
                <p><strong>Nom complet :</strong> {adminData.fullname}</p>
                <p><strong>Nom d’utilisateur :</strong> {adminData.username}</p>
                <p><strong>Email :</strong> {adminData.email}</p>
                <p><strong>Téléphone :</strong> {adminData.number}</p>
                <p><strong>Adresse :</strong> {adminData.address}</p>
                <p><strong>Date d’inscription :</strong> {new Date(adminData.createdAt).toLocaleDateString()}</p>
              </>
            ) : (
              <>
                <p><strong>Nom :</strong> {user?.prenom} {user?.name}</p>
                <p><strong>Nom d’utilisateur :</strong> {user?.username}</p>
                {user?.email && <p><strong>Email :</strong> {user.email}</p>}
                <p><strong>Rôle :</strong> {user?.role || "Utilisateur"}</p>
                <p><strong>Date d’inscription :</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
              </>
            )}
          </div>
        </div>

        {/* Liste des utilisateurs */}
        {roleType === "admin" && (
          <div className="profil-card">
            <h2>👥 Utilisateurs liés</h2>
            {linkedUsers.length > 0 ? (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {linkedUsers.map((u) => (
                  <li key={u._id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                    <strong>{u.prenom} {u.name}</strong> — {u.username} ({u.role})
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun utilisateur lié pour le moment.</p>
            )}
          </div>
        )}

        {roleType === "admin" && (
  <button
    className="btn-save"
    style={{ marginTop: "1rem", backgroundColor: "#4b00cc" }}
    onClick={openEditModal}
  >
    ✏️ Mettre à jour le profil
  </button>
)}

        {/* 🎨 Gestion Signature */}
        <div className="signature-section">
          <h2>Signature</h2>
          {roleType === "admin" ? (
            <>
              <canvas
                ref={canvasRef}
                width={window.innerWidth > 768 ? 600 : 300}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ border: "1px solid #ccc", borderRadius: 5, background: "#fff" }}
              />
              <div style={{ marginTop: 10 }}>
                <button className="btn-save" onClick={handleSaveSignature}>Enregistrer la signature</button>
                <button className="btn-save" onClick={handleResetCanvas} style={{ backgroundColor: "#e74c3c", marginLeft: 10 }}>Réinitialiser</button>
              </div>

              {signatures.length > 0 && (
                <div className="signature-list">
                  {signatures.map((sig, index) => (
                    <div key={index} className="signature-item" style={{
                      display: "inline-block",
                      margin: 5,
                      border: selectedSignature === sig ? "2px solid #4b00cc" : "1px solid #ccc",
                      borderRadius: 5,
                      padding: 5,
                      textAlign: "center"
                    }}>
                      <img src={sig} alt={`Signature ${index + 1}`} style={{ width: 120, height: 60, objectFit: "contain" }} />
                         <button
        onClick={() => handleSelectSignature(sig)}  // ✅ ici on appelle handleSelectSignature
        style={{
          display: "block",
          marginTop: 3,
          width: "100%",
          background: "#4b00cc",
          color: "#fff",
          border: "none",
          borderRadius: 3,
          cursor: "pointer",
        }}
      >
        Sélectionner
      </button>
      <button
        onClick={() => handleDeleteSignature(index)}
        style={{
          display: "block",
          marginTop: 3,
          width: "100%",
          background: "#e74c3c",
          color: "#fff",
          border: "none",
          borderRadius: 3,
          cursor: "pointer",
        }}>
        Supprimer
      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "#d9534f", fontWeight: "bold" }}>
              🚫 Cette fonctionnalité est réservée uniquement à l’administrateur.
            </p>
          )}
        </div>

        {editModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>🔧 Mettre à jour le profil</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="text"
            value={editNumber}
            onChange={(e) => setEditNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Adresse</label>
          <input
            type="text"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nouveau mot de passe (facultatif)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button type="submit" className="btn-save">Enregistrer</button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => setEditModalOpen(false)}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        <style>{`
        .modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
.modal-content h2 {
  margin-bottom: 1rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  text-align: left;
}
.form-group label {
  font-weight: bold;
  margin-bottom: 0.3rem;
}
.form-group input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}
.btn-cancel {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-cancel:hover { background: #c0392b; }
                   .profil-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: #f9f9f9;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            font-family: sans-serif;
          }
          h1 {
            text-align: center;
            margin-bottom: 1.5rem;
            color: #333;
          }
          .profil-card {
            background: #fff;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          }
          .profil-info p {
            margin: 0.3rem 0;
            color: #555;
          }
          .signature-section {
            background: #fff;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          .btn-save {
            padding: 0.6rem 1.2rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            background: #4b00cc;
            color: #fff;
          }
          .btn-save:hover {
            background: #35008f;
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
}
     <style>{`

        `}</style>



        