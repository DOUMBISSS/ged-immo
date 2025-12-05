import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";

// 🔹 Définition complète des rôles & permissions
export const rolesPermissions = {
  // 🔸 Administrateur principal
  admin: [
    "view_users", "create_users", "edit_users", "delete_users",
    "view_documents", "upload_documents", "delete_documents",
    "create_projects", "view_projects", "edit_projects", "delete_projects",
    "create_homes", "view_homes", "edit_homes", "delete_homes", "archive_homes",
    "create_tenants", "view_tenants", "edit_tenants", "delete_tenants", "archive_tenants",
    "manage_rentals", "manage_payments", "view_payments","manage_work",
    "generate_reports", "manage_settings", "view_archives", "allow_signatures","send_receipt","edit_rent"
  ],

  // 🔸 Manager
  manager: [
    "view_users",
    "view_documents", "upload_documents",
    "create_projects", "view_projects", "edit_projects",
    "create_homes", "view_homes", "edit_homes",
    "create_tenants", "view_tenants", "edit_tenants", "archive_tenants",
    "manage_payments", "edit_payments", "view_payments", "delete_payments",
    "generate_reports"
  ],

  // 🔸 Agent immobilier
  agent: [
    "view_documents", "upload_documents", "view_archives",
    "view_projects", "create_homes", "view_homes", "archive_homes",
    "create_tenants", "view_tenants", "edit_tenants",
    "manage_payments"
  ],

  // 🔸 Auditeur
  auditor: [
    "view_projects", "view_homes", "view_tenants",
    "view_documents", "view_payments", "generate_reports"
  ],

  // 🔸 Utilisateur standard (fallback)
  user: [
    "view_documents", "upload_documents", "view_archives",
    "create_tenants", "view_tenants", "edit_tenants",
    "archive_homes", "edit_projects",
    "create_homes", "edit_homes", "view_homes",
    "view_projects", "view_payments", "create_projects",
    "manage_rentals", "manage_payments",
  ]
};

// 🔹 Libellés conviviaux
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

export default function EditPermissionsModal({ user, onClose, onUpdated }) {
  const { user: currentUser } = useUserContext();
  const [permissions, setPermissions] = useState(user.permissions || []);
  const [role, setRole] = useState(user.role || "agent");
  const [loading, setLoading] = useState(false);

  // 🔹 Toutes les permissions disponibles
  const allPermissions = useMemo(() => {
    const perms = new Set();
    Object.values(rolesPermissions).forEach(roleList => roleList.forEach(p => perms.add(p)));
    return Array.from(perms).sort();
  }, []);

  // 🔹 Lorsque le rôle change, on ajoute uniquement les permissions par défaut non présentes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const rolePerms = rolesPermissions[newRole] || [];
    setPermissions(prev => {
      const merged = new Set([...prev, ...rolePerms]);
      return Array.from(merged);
    });
  };

  const handleToggle = (perm) => {
    setPermissions(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!currentUser?.token) {
      toast.error("Vous devez être connecté pour modifier les permissions.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `https://backend-ged-immo.onrender.com/users/${user._id}/permissions`,
        { role, permissions },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      toast.success("✅ Permissions mises à jour !");
      onUpdated(res.data.user);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur de mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay--perm">
      <div className="modal--perm">
        <header>
          <h3>🔐 Modifier le rôle & permissions</h3>
          <button onClick={onClose}>✕</button>
        </header>

        <p><strong>Utilisateur :</strong> {user.name} {user.prenom}</p>

        <div style={{ marginBottom: 10 }}>
          <label><strong>Rôle :</strong></label>
          <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
            {Object.keys(rolesPermissions).map(r => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="permissions-list">
          {allPermissions.map(perm => (
            <label key={perm} className="perm-item">
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => handleToggle(perm)}
              />
              <span>{permissionLabels[perm] || perm}</span>
            </label>
          ))}
        </div>

        <footer>
          <button onClick={onClose} className="btn-cancel">Annuler</button>
          <button onClick={handleSave} className="btn-save" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </footer>
      </div>

<style jsx="true">{`
  .overlay--perm {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal--perm {
    background: #ffffff;
    border-radius: 16px;
    width: 500px;
    padding: 30px 25px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { transform: translateY(-30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #111827;
  }

  header button {
    background: transparent;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  header button:hover {
    transform: rotate(90deg);
    color: #f87171;
  }

  select {
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .permissions-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
    padding: 12px;
    border-radius: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .perm-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.92rem;
    padding: 6px 10px;
    border-radius: 8px;
    transition: background 0.2s ease;
    cursor: pointer;
  }

  .perm-item:hover {
    background: rgba(37, 99, 235, 0.05);
  }

  .perm-item input[type="checkbox"] {
    accent-color: #2563eb;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }

  .btn-cancel {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-cancel:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .btn-save {
    background: #2563eb;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-save:hover {
    background: #1e40af;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
  }

  .btn-save:disabled {
    background: #93c5fd;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`}</style>
    </div>
  );
}