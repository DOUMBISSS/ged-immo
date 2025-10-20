import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext";

// 🔹 Définition complète des rôles & permissions
export const rolesPermissions = {
  admin: [
    "view_users", "create_users", "edit_users", "delete_users",
    "view_documents", "upload_documents", "delete_documents",
    "create_projects", "view_projects", "edit_projects", "delete_projects",
    "create_homes", "view_homes", "edit_homes", "delete_homes", "archive_homes",
    "create_tenants", "view_tenants", "edit_tenants", "delete_tenants", "archive_tenants",
    "manage_rentals", "manage_payments", "view_payments",
    "generate_reports", "manage_settings", "view_archives"
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
    "manage_payments", 
    // "edit_payments", 
    // "view_payments",
    //  "delete_payments"
  ],

  auditor: [
    "view_projects", "view_homes", "view_tenants",
    "view_documents", "view_payments", "generate_reports"
  ],
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
  view_archives: "Voir archives"
};

export default function EditPermissionsModal({ user, onClose, onUpdated }) {
  const { user: currentUser } = useUserContext();
  const [permissions, setPermissions] = useState(user.permissions || []);
  const [role, setRole] = useState(user.role || "agent");
  const [loading, setLoading] = useState(false);

  // 🔹 Génère automatiquement la liste de TOUTES les permissions disponibles
  const allPermissions = useMemo(() => {
    const perms = new Set();
    Object.values(rolesPermissions).forEach(roleList => {
      roleList.forEach(p => perms.add(p));
    });
    return Array.from(perms).sort();
  }, []);

  // 🔹 Recalcule les permissions par défaut selon le rôle
  useEffect(() => {
    if (rolesPermissions[role]) {
      setPermissions(rolesPermissions[role]);
    }
  }, [role]);

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
        `http://localhost:4000/users/${user._id}/permissions`,
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
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.keys(rolesPermissions).map((r) => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="permissions-list">
          {allPermissions.map((perm) => (
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
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal--perm {
          background: white;
          border-radius: 10px;
          width: 480px;
          padding: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .permissions-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #f9fafb;
        }
        .perm-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }
        footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 15px;
        }
        .btn-cancel {
          background: #e5e7eb;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
        }
        .btn-save {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}