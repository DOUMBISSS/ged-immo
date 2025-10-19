import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUserContext } from "../../contexts/UserContext"; // Ajuste le chemin si nécessaire

// 🔹 Roles & permissions à jour
export const rolesPermissions = {
  admin: [
    // 👤 Gestion des utilisateurs
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",

    // 📁 Gestion des documents
    "view_documents",
    "upload_documents",
    "delete_documents",

    // 🏗️ Gestion des projets
    "create_projects",
    "view_projects",
    "edit_projects",
    "delete_projects",

    // 🏠 Gestion des maisons
    "create_homes",
    "view_homes",
    "edit_homes",
    "delete_homes",
       "archive_homes",
       
    // 👥 Gestion des locataires
    "create_tenants",
    "view_tenants",
    "edit_tenants",
    "delete_tenants",
    "archive_tenants",

    // 💸 Gestion des loyers et paiements
    "manage_rentals",
    "manage_payments",
    "view_payments",

    // ⚙️ Administration générale
    "generate_reports",
    "manage_settings"
  ],

  manager: [
    // 👥 Gestion limitée des utilisateurs
    "view_users",

    // 📁 Gestion des documents
    "view_documents",
    "upload_documents",

    // 🏗️ Projets
    "create_projects",
    "view_projects",
    "edit_projects",

    // 🏠 Maisons
    "create_homes",
    "view_homes",
    "edit_homes",

    // 👥 Locataires
    "create_tenants",
    "view_tenants",
    "edit_tenants",
    "archive_tenants",

     "manage_payments",
    "edit_payments",
    "view_payments",
    "delete_payments",

    // 📊 Rapports
    "generate_reports"
  ],

  agent: [
    // 📁 Documents
    "view_documents",
    "upload_documents",

    // 🏗️ Projets & maisons
    "view_projects",
      "create_homes",
    "view_homes",
    "archive_homes",

    // 👥 Locataires
    "create_tenants",
    "view_tenants",
    "edit_tenants",

     "manage_payments",
    "edit_payments",
    "view_payments",
    "delete_payments",
  ],

  auditor: [
    "view_projects",
    "view_homes",
    "view_tenants",
    "view_documents",
    "view_payments",
    "generate_reports"
  ],
};
export default function EditPermissionsModal({ user, onClose, onUpdated, permissionLabels, allPermissions }) {
  const { user: currentUser } = useUserContext(); // 🔹 Token de l'utilisateur connecté
  const [permissions, setPermissions] = useState(user.permissions || []);
  const [role, setRole] = useState(user.role || "agent");
  const [loading, setLoading] = useState(false);

  // 🔹 Recalcul automatique des permissions selon le rôle sélectionné
  useEffect(() => {
    if (role && rolesPermissions[role]) {
      setPermissions(rolesPermissions[role]);
    }
  }, [role]);

  const handleToggle = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
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
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`, // ✅ Utilisation du token connecté
          },
        }
      );
      toast.success("Permissions et rôle mis à jour !");
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