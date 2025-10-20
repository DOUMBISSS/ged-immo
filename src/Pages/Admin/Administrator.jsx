import React, { useContext, useState, useEffect } from "react";
import { useUserContext } from "../../contexts/UserContext";
import CreateUserModal from "./CreateUserModal";
import EditPermissionsModal from "./EditPermissionsModal";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Link } from "react-router-dom";

export default function Administrator() {
  const { user } = useUserContext();
  const [showModalUser, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

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
  // Utilisateurs
  view_users: "Voir les utilisateurs",
  create_users: "Créer des utilisateurs",
  edit_users: "Modifier des utilisateurs",
  delete_users: "Supprimer des utilisateurs",

  // Documents
  view_documents: "Consulter les documents",
  upload_documents: "Téléverser des documents",
  delete_documents: "Supprimer des documents",

  // Projets
  create_projects: "Créer des projets",
  view_projects: "Voir les projets",
  edit_projects: "Modifier des projets",
  delete_projects: "Supprimer des projets",

  // Maisons
  create_homes: "Créer des maisons",
  view_homes: "Voir les maisons",
  edit_homes: "Modifier des maisons",
  delete_homes: "Supprimer des maisons",
  archive_homes: "Archiver des maisons",

  // Locataires
  create_tenants: "Créer des locataires",
  view_tenants: "Voir les locataires",
  edit_tenants: "Modifier des locataires",
  delete_tenants: "Supprimer des locataires",
  archive_tenants: "Archiver des locataires",

  // Paiements / locations
  manage_payments: "Gérer les paiements",
  view_payments: "Voir les paiements",
  edit_payments:"Modifier les paiements",
  delete_payments:"Supprimer les paiements",

  // Rapports / paramètres
  generate_reports: "Générer des rapports",
  manage_settings: "Gérer les paramètres",

  view_archives:"Voir les archives"
};

const fetchUsers = async () => {
  if (!adminId || !user?.token) return;

  try {
    const res = await fetch(`http://localhost:4000/admin/${adminId}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`, // <-- ici on envoie le token
      },
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
// 🗑️ Suppression utilisateur avec toast de confirmation
const handleDeleteUser = (userId, name) => {
  const ConfirmDelete = ({ closeToast }) => (
    <div>
      <p>Voulez-vous vraiment supprimer {name} ?</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer"
          }}
          onClick={async () => {
            closeToast();
            try {
              const res = await fetch(`http://localhost:4000/admin/${adminId}/users/${userId}`, {
                method: "DELETE",
              });
              const data = await res.json();

              if (data.success) {
                toast.success(`Utilisateur ${name} supprimé ✅`);
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
            cursor: "pointer"
          }}
          onClick={closeToast}
        >
          Annuler
        </button>
      </div>
    </div>
  );

  toast.info(<ConfirmDelete />, {
    autoClose: false,
    closeButton: false,
    position: "top-center",
    draggable: false,
  });
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
            <button className="btn-actions">
            Actions
          </button>
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
                        <span className={`role-badge ${u.role?.toLowerCase() || "user"}`}>
                          {u.role || "Utilisateur"}
                        </span>
                      </td>
                      <td>
                        {/* {u.permissions?.length
                          ? u.permissions.map((perm) => permissionLabels[perm] || perm).join(", ")
                          : "—"} */}

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
                      <td >
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
                            marginRight:"2rem"
                          }}>
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u._id, `${u.name} ${u.prenom}`)}
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
      // 👤 Utilisateurs
      "manage_admins", "view_users", "create_users", "edit_users", "delete_users",

      // 📁 Documents
      "view_documents", "upload_documents", "delete_documents",

      // 🏗️ Projets
      "create_projects", "view_projects", "edit_projects", "delete_projects",

      // 🏠 Maisons
      "create_homes", "view_homes", "edit_homes", "delete_homes","archive_homes",

      // 👥 Locataires
      "create_tenants", "view_tenants", "edit_tenants", "delete_tenants", "archive_tenants",

      // 💸 Gestion des loyers et paiements
       "manage_payments","edit_payments","view_payments","delete_payments",

      // ⚙️ Paramètres et rapports
      "generate_reports", "manage_settings"
    ]}
  />
)}
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

/* Rôle badge */
.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  color: #fff;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  font-size: 0.85rem;
}
.role-badge.admin { background-color: #dc2626; }
.role-badge.user { background-color: #2563eb; }
.role-badge.moderator { background-color: #f59e0b; }

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