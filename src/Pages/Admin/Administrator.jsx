import React, { useContext, useState, useEffect } from "react";
import { useUserContext } from "../../contexts/UserContext";
import CreateUserModal from "./CreateUserModal";
import EditPermissionsModal from "./EditPermissionsModal";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function Administrator() {
  const { user,getAuthHeaders } = useUserContext();
  const [showModalUser, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserModal, setDeleteUserModal] = useState({ isOpen: false, userId: null, userName: "" });

  const adminId = user?._id;

  useEffect(() => {
    if (adminId) fetchUsers();
  }, [adminId]);

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Chargement du profil administrateur...</p>
      </div>
    );
  }

const permissionLabels = {
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
   edit_rent:"Modifier Loyer",
};

  const fetchUsers = async () => {
    if (!adminId || !user?.token) return;

    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/admin/${adminId}/users`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.warn("Réponse inattendue de l'API :", data);
        setUsers([]);
      }
    } catch (err) {
      toast.error("Erreur de chargement des utilisateurs");
      console.error(err);
      setUsers([]);
    }
  };

  const handleDeleteUser = (userId, name) => {
    const ConfirmDelete = ({ closeToast }) => (
      <div style={{ padding: "8px 0" }}>
        <p>Voulez-vous vraiment supprimer <strong>{name}</strong> ?</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={async () => {
              closeToast();
              try {
                const res = await fetch(`https://backend-ged-immo.onrender.com/admin/${user._id}/users/${userId}`, {
                  method: "DELETE",
                  headers: getAuthHeaders(),
                });
                const data = await res.json();
                if (data.success) {
                  toast.success(data.message || `Utilisateur ${name} supprimé ✅`);
                  setUsers((prev) => prev.filter((u) => u._id !== userId));
                } else {
                  toast.error(data.message || "Erreur lors de la suppression.");
                }
              } catch (error) {
                console.error(error);
                toast.error("Erreur de connexion au serveur.");
              }
            }}
          >
            Confirmer
          </button>
          <button
            style={{
              background: "#ccc",
              color: "#111",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              closeToast();
              toast("Suppression annulée", { icon: "⚠️" });
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    );

    toast.custom((t) => <ConfirmDelete closeToast={() => toast.dismiss(t.id)} />);
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <div className="admin-header">
          <div>
            <h2>👨‍💼 Gestion des utilisateurs</h2>
            <p>Créez, gérez et attribuez les rôles & permissions de vos utilisateurs.</p>
          </div>

          <div>
            <Link to="/Actions">
              <button className="btn-actions">Actions</button>
            </Link>
            <button onClick={() => setShowModal(true)} className="btn-create">
              + Nouvel utilisateur
            </button>
          </div>
        </div>

        <div className="admin-card">
          {users.length === 0 ? (
            <p className="empty-state">Aucun utilisateur créé pour le moment.</p>
          ) : (
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Nom & Prénom</th>
                    <th>Email</th>
                    <th>Nom d’utilisateur</th>
                    <th>Mot de passe</th>
                    <th>Rôle</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name} {u.prenom}</td>
                      <td>{u.email || "—"}</td>
                      <td>{u.username || "—"}</td>
                      <td>
                        <span
                          style={{
                            cursor: "pointer",
                            fontFamily: "monospace",
                            userSelect: "none",
                          }}
                          onClick={(e) => {
                            e.target.textContent =
                              e.target.textContent === "********" ? u.password : "********";
                          }}
                        >
                          ********
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role?.toLowerCase() || "agent"}`}>
                          {u.role || "Utilisateur"}
                        </span>
                      </td>
                      <td>
                        {u.permissions?.length ? (
                          <ul>
                            {u.permissions.map((perm) => (
                              <li key={perm} className="list-permissions">
                                {permissionLabels[perm] || perm}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => setEditUser(u)}
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            marginRight: "1rem",
                          }}
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => setDeleteUserModal({ isOpen: true, userId: u._id, userName: `${u.name} ${u.prenom}` })}
                          style={{
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModalUser && (
          <CreateUserModal
            adminId={adminId}
            onClose={() => setShowModal(false)}
            onUserCreated={fetchUsers}
          />
        )}

        {editUser && (
          <EditPermissionsModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onUpdated={() => {
              fetchUsers();
              setEditUser(null);
            }}
            permissionLabels={permissionLabels}
            allPermissions={[
              "view_users", "create_users", "edit_users", "delete_users",
    "view_documents", "upload_documents", "delete_documents",
    "create_projects", "view_projects", "edit_projects", "delete_projects",
    "create_homes", "view_homes", "edit_homes", "delete_homes", "archive_homes",
    "create_tenants", "view_tenants", "edit_tenants", "delete_tenants", "archive_tenants", "manage_payments", "view_payments",
    "generate_reports", "manage_settings", "view_archives", "allow_signatures","manage_work",
    "send_receipt","edit_rent"
            ]}
          />
        )}

        <ConfirmDeleteModal
  isOpen={deleteUserModal.isOpen}
  userName={deleteUserModal.userName}
  onClose={() => setDeleteUserModal({ isOpen: false, userId: null, userName: "" })}
  onConfirm={async () => {
    try {
      const res = await fetch(`https://backend-ged-immo.onrender.com/admin/${user._id}/users/${deleteUserModal.userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Utilisateur ${deleteUserModal.userName} supprimé ✅`);
        setUsers(prev => prev.filter(u => u._id !== deleteUserModal.userId));
      } else {
        toast.error(data.message || "Erreur lors de la suppression.");
      }
    } catch (err) {
      toast.error("Erreur de connexion au serveur.");
      console.error(err);
    }
    setDeleteUserModal({ isOpen: false, userId: null, userName: "" });
  }}
/>
      </div>
      <Footer/>

      <style jsx="true">{`
        .admin-dashboard {
          padding: 40px 60px;
          background: #f9fafc;
          min-height: 100vh;
          color: #111827;
          font-family: 'Inter', sans-serif;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .admin-header h2 {
          font-size: 1.8rem;
          font-weight: 600;
          color: #1e3a8a;
        }

        .btn-create {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          box-shadow: 0 3px 10px rgba(37, 99, 235, 0.2);
        }

        .user-table td button:hover {
          opacity: 0.85;
        }
          .btn-actions {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-right:1rem;
          box-shadow: 0 3px 10px rgba(37, 99, 235, 0.2);
        }
          /* Conteneur du tableau */
.table-container {
  width: 100%;
  overflow-x: auto; /* Scroll horizontal si petit écran */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin-top: 20px;
}

/* Tableau */
.user-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px; /* garantit une largeur minimum */
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
}

/* Entête du tableau */
.user-table thead {
  background-color: #f4f6f8;
  color: #34495e;
  font-weight: 600;
  text-align: left;
  border-bottom: 2px solid #ddd;
}

.user-table th, 
.user-table td {
  padding: 12px 15px;
  text-align: left;
  vertical-align: middle;
  word-break: break-word;
}

/* Lignes du tableau */
.user-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: background 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #f0f4f8;
}

/* Boutons */
.user-table button {
  transition: all 0.2s ease;
}
.user-table button:hover {
  opacity: 0.85;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  color: #fff;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  font-size: 0.85rem;
}
.role-badge.admin { background-color: #dc2626; }       /* Rouge pour Admin */
.role-badge.agent { background-color: #2563eb; }        /* Bleu pour User */
.role-badge.user { background-color: #dc2626; }        /* Bleu pour User */
.role-badge.moderator { background-color: #f59e0b; }   /* Orange pour Modérateur */

/* Liste des permissions */
.list-permissions {
  font-size: 0.85rem;
  padding-left: 0;
  margin: 2px 0;
  list-style-type: disc;
}

/* Responsive */
@media (max-width: 1024px) {
  .user-table th, 
  .user-table td {
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .user-table {
    font-size: 0.85rem;
    min-width: 600px;
  }
}

@media (max-width: 480px) {
  .user-table {
    min-width: 500px;
  }

  .user-table td button {
    padding: 4px 6px;
    font-size: 0.75rem;
  }
}
      `}</style>
    </>
  );
}