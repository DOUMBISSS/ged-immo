import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserContext } from "../../contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";

// 🔹 Mapping des rôles et permissions
export const rolesPermissions = {
  admin: [
    "view_users", "create_users", "edit_users", "delete_users",
    "view_documents", "upload_documents", "delete_documents",
    "create_projects", "view_projects", "edit_projects", "delete_projects",
    "create_homes", "view_homes", "edit_homes", "delete_homes", "archive_homes",
    "create_tenants", "view_tenants", "edit_tenants", "delete_tenants", "archive_tenants",
    "manage_rentals", "manage_payments", "view_payments",
    "generate_reports", "manage_settings", "view_archives", "allow_signatures",
    "manage_work","send_receipt","edit_rent"
  ],
  manager: [
    "view_users",
    "view_documents", "upload_documents",
    "create_projects", "view_projects", "edit_projects",
    "create_homes", "view_homes", "edit_homes",
    "create_tenants", "view_tenants", "edit_tenants", "archive_tenants",
    "manage_payments", "edit_payments", "view_payments", "delete_payments",
    "generate_reports"
  ],
  agent: [
    "view_documents", "upload_documents", "view_archives",
    "view_projects", "create_homes", "view_homes", "archive_homes",
    "create_tenants", "view_tenants", "edit_tenants",
    "manage_payments"
  ],
  auditor: [
    "view_projects", "view_homes", "view_tenants",
    "view_documents", "view_payments", "generate_reports"
  ],
  user: [
    "view_documents", "upload_documents", "view_archives",
    "create_tenants", "view_tenants", "edit_tenants", "archive_homes",
    "edit_projects", "create_homes", "edit_homes", "view_homes",
    "view_projects", "view_payments", "create_projects",
    "manage_rentals", "manage_payments","send_receipt"
  ]
};

// 🔹 Traduction FR pour affichage
export const permissionLabels = {
  view_users: "Voir utilisateurs",
  create_users: "Créer utilisateurs",
  edit_users: "Modifier utilisateurs",
  delete_users: "Supprimer utilisateurs",
  view_documents: "Voir documents",
  upload_documents: "Uploader documents",
  delete_documents: "Supprimer documents",
  create_projects: "Créer projets",
  view_projects: "Voir projets",
  edit_projects: "Modifier projets",
  delete_projects: "Supprimer projets",
  create_homes: "Créer maisons",
  view_homes: "Voir maisons",
  edit_homes: "Modifier maisons",
  delete_homes: "Supprimer maisons",
  archive_homes: "Archiver maisons",
  create_tenants: "Créer locataires",
  view_tenants: "Voir locataires",
  edit_tenants: "Modifier locataires",
  delete_tenants: "Supprimer locataires",
  archive_tenants: "Archiver locataires",
  manage_rentals: "Gérer loyers",
  manage_payments: "Gérer paiements",
  edit_payments: "Modifier paiements",
  delete_payments: "Supprimer paiements",
  view_payments: "Voir paiements",
  generate_reports: "Générer rapports",
  manage_settings: "Paramètres généraux",
  view_archives: "Voir archives",
  allow_signatures:"Autoriser les signatures",
  manage_work:"Autoriser les travaux",
   send_receipt:"Envoi reçu/mail",
   edit_rent:"Modifier Loyer"
};

const allPermissions = Array.from(new Set(Object.values(rolesPermissions).flat()));

function random8() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

export default function CreateUserModal({ adminId, onClose, onUserCreated }) {
  const { user } = useUserContext();
  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    username: "",
    password: "",
    role: "user",
    permissions: rolesPermissions["user"],
  });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        name: form.name,
        prenom: form.prenom,
        role: form.role,
        permissions: form.permissions,
      };
      if (form.email) payload.email = form.email;
      if (form.username) payload.username = form.username;
      if (form.password) payload.password = form.password;

      const res = await axios.post(
        `https://backend-ged-immo.onrender.com/create/${adminId}/users`,
        payload,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      toast.success("✅ Utilisateur créé avec succès !");
      setCredentials(res.data.credentials || {
        username: payload.username,
        password: payload.password,
      });
      onUserCreated && onUserCreated();

    } catch (error) {
      console.error("Erreur création utilisateur :", error);

      // 🔥 Si la limite d’abonnement est atteinte
      if (error.response?.status === 403) {
        const message =
          error.response?.data?.message ||
          "🚫 Vous avez atteint la limite d’utilisateurs pour votre plan actuel.";
        toast.error(message, {
          position: "top-center",
          style: {
            background: "#fffbea",
            color: "#92400e",
            fontWeight: 500,
            border: "1px solid #facc15",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 9999, // 🔝 pour rester au-dessus du modal
          },
        });
      } else {
        toast.error(error.response?.data?.message || "❌ Erreur lors de la création.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("✅ Copié dans le presse‑papier");
  };

  return (
    <div className="overlay--user">
      {/* 🔹 Toaster directement dans le modal */}
      <Toaster containerStyle={{ zIndex: 10000 }} />

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
/* Overlay & modal inchangés */
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
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  animation: fadeIn 0.25s ease;
  font-family: 'Inter', sans-serif;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 { color: #1e3a8a; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 1.4rem; color: #6b7280; cursor: pointer; transition: all 0.2s; }
.close-btn:hover { color: #2563eb; transform: scale(1.1); }

/* Form grid */
.form-grid { display: flex; gap: 10px; }

/* Labels */
label { font-weight: 500; font-size: 0.9rem; margin-bottom: 4px; display: block; }

/* Inputs & Select */
input, select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  margin-bottom: 15px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #fefefe;
}
input:focus, select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235,0.2);
}

/* Buttons */
.flex-row { display: flex; gap: 8px; align-items: center; }
.btn-generate {
  background: #e0e7ff;
  color: #1e40af;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-generate:hover { background: #c7d2fe; transform: translateY(-1px); }

/* Permissions en cartes flottantes */
.permissions-section {
  border: none;
  background: #f9fafb;
  padding: 15px;
  border-radius: 12px;
  margin-top: 15px;
}
.permissions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}
.permissions-list::-webkit-scrollbar { width: 6px; }
.permissions-list::-webkit-scrollbar-track { background: #f9fafb; border-radius: 6px; }
.permissions-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }

/* Carte permission */
.perm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;
}
.perm-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  background: #e0f2fe;
}
.perm-item input { accent-color: #2563eb; cursor: pointer; width: 16px; height: 16px; }

/* Footer */
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel {
  background: #f3f4f6;
  color: #111;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-cancel:hover { background: #e5e7eb; }
.btn-save {
  background: linear-gradient(135deg, #93c5fd, #3b82f6);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(59,130,246,0.3);
  font-weight: 500;
  transition: all 0.2s;
}
.btn-save:hover { box-shadow: 0 5px 15px rgba(59,130,246,0.4); transform: translateY(-1px); }

/* Panel credentials */
.credentials-panel { padding: 15px; background: #f1f9ff; border-radius: 12px; }

/* Hint / petites notes */
.hint { font-size: 0.8rem; color: #6b7280; }

@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
`}</style>
    </div>
  );
}