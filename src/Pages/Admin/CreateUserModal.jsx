import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// 🔹 Ton mapping de rôles et permissions (clé technique)
// rolesPermissions.js

export const rolesPermissions = {
  admin: [
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
    "view_documents",
    "upload_documents",
    "delete_documents",
    "manage_rentals",
    "manage_payments",
    "generate_reports",
    "manage_settings",
    "view_payments",
  ],
  manager: [
    "view_documents",
    "upload_documents",
    "manage_rentals",
    "manage_payments",
    "generate_reports",
    "view_payments",
  ],
  agent: [
    "view_documents",
    "upload_documents",
    "manage_rentals",
    "view_payments",
  ],
  auditor: [
    "view_documents",
    "view_payments",
    "generate_reports",
  ],
};

// 🔹 Traduction FR pour affichage lisible
const permissionLabels = {
  manage_admins: "Gérer les administrateurs",
  view_users: "Voir les utilisateurs",
  create_users: "Créer des utilisateurs",
  edit_users: "Modifier des utilisateurs",
  delete_users: "Supprimer des utilisateurs",
  view_documents: "Consulter les documents",
  upload_documents: "Téléverser des documents",
  delete_documents: "Supprimer des documents",
  manage_rentals: "Gérer les locations",
  manage_payments: "Gérer les paiements",
  generate_reports: "Générer des rapports",
  manage_settings: "Gérer les paramètres",
  view_payments: "Voir les paiements",
};

// 🔹 Liste complète des permissions disponibles

const allPermissions = Array.from(new Set(Object.values(rolesPermissions).flat()));

function random8() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

export default function CreateUserModal({ adminId, onClose, onUserCreated }) {
  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    username: "",
    password: "",
    role: "agent",
    permissions: rolesPermissions["agent"],
  });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null); // affichage après création

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      permissions: rolesPermissions[prev.role] || [],
    }));
  }, [form.role]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePermissionToggle = (perm) => {
    setForm((prev) => {
      const alreadyChecked = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: alreadyChecked ? prev.permissions.filter((p) => p !== perm) : [...prev.permissions, perm],
      };
    });
  };

  const handleGenerate = () => {
    setForm((prev) => ({ ...prev, username: random8(), password: random8() }));
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Construire payload — si email vide, on peut omettre le champ
      const payload = {
        name: form.name,
        prenom: form.prenom,
        role: form.role,
        permissions: form.permissions,
      };
      if (form.email) payload.email = form.email;
      if (form.username) payload.username = form.username;
      if (form.password) payload.password = form.password;

      const res = await axios.post(`http://localhost:4000/create/${adminId}/users`, payload);

      toast.success("Utilisateur créé avec succès !");
      // res.data.credentials contient username/password générés ou fournis
      setCredentials(res.data.credentials || { username: payload.username, password: payload.password });
      onUserCreated && onUserCreated(); // refresh côté parent
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Copié dans le presse‑papier");
  };

  return (
    <div className="overlay--user">
      <div className="modal--user">
        <header className="modal-header">
          <h3>👤 Créer un nouvel utilisateur</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </header>

        {!credentials ? (
        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-grid">
            <div>
              <label>Nom*</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <label>Prénom*</label>
              <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required />
            </div>
          </div>

          <label>Email (optionnel)</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ex: contact@exemple.com" />

          <label>Nom d'utilisateur (optionnel)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Laisser vide pour générer" />
            <button type="button" onClick={() => setForm(prev => ({ ...prev, username: random8() }))}>Générer</button>
          </div>

          <label>Mot de passe (optionnel)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" name="password" value={form.password} onChange={handleChange} placeholder="Laisser vide pour générer" />
            <button type="button" onClick={() => setForm(prev => ({ ...prev, password: random8() }))}>Générer</button>
          </div>

          <label>Rôle*</label>
          <select name="role" value={form.role} onChange={handleChange}>
            {Object.keys(rolesPermissions).map((r) => (<option key={r} value={r}>{r.replace("_", " ").toUpperCase()}</option>))}
          </select>

          <div className="permissions-section">
            <h4>🔐 Permissions</h4>
            <p className="hint">Cochez les droits personnalisés à accorder</p>
            <div className="permissions-list">
              {allPermissions.map((perm) => (
                <label key={perm} className="perm-item">
                  <input type="checkbox" checked={form.permissions.includes(perm)} onChange={() => handlePermissionToggle(perm)} />
                  <span>{permissionLabels[perm] || perm}</span>
                </label>
              ))}
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save" disabled={loading}>{loading ? "Création..." : "Créer"}</button>
          </footer>
        </form>
        ) : (
          <div className="credentials-panel">
            <h4>Accès utilisateur créés</h4>
            <p><strong>Username :</strong> {credentials.username}</p>
            <p><strong>Mot de passe :</strong> {credentials.password}</p>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => copyToClipboard(`username: ${credentials.username}\npassword: ${credentials.password}`)}>Copier les accès</button>
              <button onClick={() => { setCredentials(null); onClose(); }}>Fermer</button>
            </div>

            <p style={{ marginTop: 12, fontSize: 12, color: '#555' }}>
              Remarque : le mot de passe est stocké en clair temporairement — pense à activer le hash et un flux de reset après test.
            </p>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .overlay--user {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .modal--user {
          background: #fff;
          border-radius: 16px;
          width: 620px;
          padding: 30px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          animation: fadeIn 0.25s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #1e3a8a;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.4rem;
          color: #6b7280;
          cursor: pointer;
        }

        .form-grid {
          display: flex;
          gap: 10px;
        }

        label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        input, select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          margin-bottom: 15px;
          font-size: 0.95rem;
        }

        .permissions-section {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 15px;
          border-radius: 10px;
          margin-top: 10px;
        }

        .permissions-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          max-height: 180px;
          overflow-y: auto;
        }

        .perm-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .perm-item:hover {
          background: #f1f5f9;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 15px;
        }

        .btn-cancel {
          background: #e5e7eb;
          color: #111;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        .btn-save {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(37, 99, 235, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
            .credentials-panel { padding:12px; background:#f1f9ff; border-radius:8px; }
      `}</style>
    </div>
  );
}