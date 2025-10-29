import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Blocks } from "react-loader-spinner";
import { toast } from "react-toastify";

export default function User() {
  const navigate = useNavigate();
  const { user, clearUser } = useUserContext();

  const [persons, setPersons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [homes, setHomes] = useState([]);
  const [searchProject, setSearchProject] = useState(() => localStorage.getItem("searchProject") || "");
  const [search, setSearch] = useState(() => localStorage.getItem("search") || "");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedHome, setSelectedHome] = useState(null);
  const [countryCode, setCountryCode] = useState("+225");

  // Champs formulaire locataire
  const [name, setFullName] = useState("");
  const [lastname, setPrenom] = useState("");
  const [birth, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [nationality, setNationality] = useState("");
  const [sexe, setSexe] = useState("");
  const [tel, setTel] = useState("");
  const [profession, setProfession] = useState("");
  const [address, setAddresse] = useState("");
  const [email, setEmail] = useState("");
  const [pieces, setPiece] = useState("");
  const [date_entrance, setDateEntrance] = useState("");
  const [date_emission, setEmission] = useState("");
  const [date_expiration, setExpiration] = useState("");
  const [city, setCity] = useState("");
  const [tel_urgency, setUrgency] = useState("");
  const [situation, setSituation] = useState("");

  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("currentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const itemsPerPage = 15;

  // Sauvegarde automatique dans localStorage
  useEffect(() => { localStorage.setItem("searchProject", searchProject); }, [searchProject]);
  useEffect(() => { localStorage.setItem("search", search); }, [search]);
  useEffect(() => { localStorage.setItem("currentPage", currentPage); }, [currentPage]);

  // 🔹 Récupération unifiée (Admin ou User)
useEffect(() => {
  if (!user?._id || !user?.token) return;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/data/${user._id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`, // ✅ ajout du token
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Erreur lors de la récupération des données.");
        return;
      }

      if (data.success) {
        setProjects(data.projects || []);
        setPersons(data.persons || []);
      } else {
        toast.error(data.message || "Aucune donnée trouvée.");
      }
    } catch (err) {
      toast.error("Erreur serveur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, [user]);

  // console.log(user)

  // Récupération des biens disponibles pour le projet sélectionné
useEffect(() => {
  if (!selectedProject) {
    setHomes([]);
    return;
  }

 const fetchHomes = async () => {
  try {
    const res = await fetch(`http://localhost:4000/projects/${selectedProject}/homes`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || `Erreur HTTP ${res.status}`);
    }

    // Filtrer les maisons libres
    const availableHomes = data.homes.filter((home) => !home.personId || home.personId.length === 0);
    setHomes(availableHomes);
  } catch (err) {
    console.error("Erreur récupération biens :", err);
    setHomes([]);
  }
};

  fetchHomes();
}, [selectedProject, user?.token]);

  const handleSearch = (event) => { setSearch(event.target.value); setCurrentPage(1); };
  const logoutHandler = () => { clearUser(); navigate("/"); };

  const filteredUsers = persons
    .filter(person => !person.archived)
    .filter(person => !searchProject || String(person.homeId?.projectId) === searchProject)
    .filter(person => search === "" || person.name?.toLowerCase().includes(search.toLowerCase()));

  const handleHouseChange = (e) => {
    const selectedId = e.target.value;
    const home = homes.find((h) => h._id === selectedId);
    setSelectedHome(home || null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

// ✅ Fonction pour réinitialiser le formulaire
const resetForm = () => {
  setSelectedProject("");
  setSelectedHome(null);
  setFullName("");
  setPrenom("");
  setDate("");
  setLieu("");
  setNationality("");
  setSexe("");
  setTel("");
  setUrgency("");
  setProfession("");
  setAddresse("");
  setEmail("");
  setPiece("");
  setDateEntrance("");
  setEmission("");
  setExpiration("");
  setCity("");
  setSituation("");
};

// helper : génère une chaîne aléatoire (pour username / password)
function generateRandomString(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < length; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

// ⚡ Nouvelle state pour afficher l'erreur dans le modal
  const [modalError, setModalError] = useState("");

const handleAddLocataire = async (e) => {
  e.preventDefault();
  setModalError("");

  if (!selectedProject) return setModalError("Sélectionnez un projet.");
  if (!selectedHome) return setModalError("Sélectionnez un bien.");
  if (!user || !user._id) return setModalError("Vous devez être connecté.");

  try {
    const adminId = user.adminId || user._id;
    const generatedUsername = `${(name || 'user').toLowerCase().replace(/\s+/g, '')}_${generateRandomString(4)}`;
    const generatedPassword = generateRandomString(10);

    const payload = {
      name, lastname, email,
      username: generatedUsername,
      password: generatedPassword,
      homes: selectedHome._id || selectedHome,
      adminId,
      userId: user._id,
      birth, lieu, nationality, sexe,
      tel: `${countryCode}${tel}`,
      tel_urgency, profession, address,
      pieces, date_entrance, date_emission, date_expiration,
      situation, city,
      projectId: selectedProject
    };

    const res = await fetch("http://localhost:4000/New/Locataire", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}` 
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      setModalError(result.message || "Échec de l'ajout du locataire.");
      return;
    }

    toast.success("Locataire ajouté avec succès ✅");
    setShowAddModal(false);

    // ✅ Recharger proprement la liste des locataires
    const refresh = await fetch(`http://localhost:4000/data/${adminId}`, {
      headers: { "Authorization": `Bearer ${user?.token}` }
    });

    const refreshData = await refresh.json();
    if (refresh.ok && refreshData.success) {
      setPersons(refreshData.persons || []);
    } else if (result.person) {
      // fallback
      setPersons(prev => [result.person, ...prev]);
    }

    resetForm();

  } catch (err) {
    setModalError("Erreur serveur : " + err.message);
  }
};

// 🔹 Réinitialiser automatiquement si l'utilisateur change
useEffect(() => {
  resetForm();
}, [user]);

// Réinitialiser automatiquement si l'utilisateur connecté change
useEffect(() => {
  resetForm();
}, [user]);

  return (
    <div>
      <Navbar logoutHandler={logoutHandler} />
      <div className="saas-container">
        <div className="saas-card">
          <div className="header-actions">
            <h2><i className="fa-solid fa-users"></i> Locataires</h2>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              <i className="fa-solid fa-plus"></i> Ajouter un locataire
            </button>
          </div>

          {/* Filtres */}
          <div className="filter-section">

             {/* <label>Type de projet</label> */}
          <select className="select-field">
            <option value="">Sélectionner un type</option>
            <option value="immobilier">Immobilier</option>
            <option value="magasin">Magasin</option>
          </select>

            {/* <select
              value={searchProject}
              onChange={(e) => { setSearchProject(e.target.value); setCurrentPage(1); }}
              className="select-field">
              <option value="">Sélectionner une propriété</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select> */}

            <select
              value={searchProject}
              onChange={(e) => { setSearchProject(e.target.value); setCurrentPage(1); }}
              className="select-field">
              <option value="">Sélectionner une propriété</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>

            <div className="search-wrapper">
              <input type="text" placeholder="Rechercher un locataire..." value={search} onChange={handleSearch} />
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </div>
          </div>

          {/* Tableau locataires */}
          <div className="table-section">
            {loading ? (
              <div className="loading"><Blocks visible={true} height="80" width="80" /></div>
            ) : (
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom(s)</th>
                    <th>Contacts</th>
                    <th>Email</th>
                    <th>Adresse</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {!searchProject ? (
                    <tr><td colSpan="6" style={{ textAlign: "center", fontStyle: "italic" }}>
                      Veuillez sélectionner une propriété pour voir les locataires
                    </td></tr>
                  ) : currentUsers.length > 0 ? (
                    currentUsers.map(person => (
                      <tr key={person._id}>
                        <td>{person.name}</td>
                        <td>{person.lastname}</td>
                        <td>{person.tel}</td>
                        <td>{person.email}</td>
                        <td>{person.address}</td>
                        <td>
                          <Link to={`/detailUser/${person._id}`}>
                            <button className="btn-details">Détails</button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" style={{ textAlign: "center", fontStyle: "italic" }}>
                      Aucun locataire trouvé
                    </td></tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Précédent</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Suivant</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

 {showAddModal && (
        <div className="modal-container">
          <div className="modal-contents">
            <div className="modal-header">
              <h2><i className="fa-solid fa-user-plus"></i> Ajouter un nouveau locataire</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            {/* ⚠️ Affichage des erreurs dans le modal */}
                {modalError && (
                  <div style={{ margin: '10px 0', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px' }}>
                    {modalError}
                  </div>
                )}
            <form className="modal-body form-grid" onSubmit={handleAddLocataire}>
              {/* Champs formulaire */}
              <div className="form-group">
                <label>Noms</label>
                <input type="text" required value={name} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Prénom(s)</label>
                <input type="text" required value={lastname} onChange={(e) => setPrenom(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date de naissance</label>
                <input type="date" required value={birth} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Lieu</label>
                <input type="text" required value={lieu} onChange={(e) => setLieu(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Sexe</label>
                <select required value={sexe} onChange={(e) => setSexe(e.target.value)}>
                  <option value="">Sélectionner</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nationalité</label>
                <input type="text" required value={nationality} onChange={(e) => setNationality(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            
              <div className="form-group">
        <label>Indicatif</label>
        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="select-field">
          <option value="+225">Côte d’Ivoire (+225)</option>
          <option value="+33">France (+33)</option>
          <option value="+1">USA (+1)</option>
          {/* ajouter d’autres pays si nécessaire */}
        </select>
      </div>
             <div className="form-group">
              <label>Tel(WhatsApp)</label>
              <input
                type="text"
                required
                value={tel}
                onChange={(e) => setTel(e.target.value.replace(/\D/g, ""))} // supprime tout ce qui n’est pas un chiffre
                placeholder="Numéro sans indicatif"
              />
            </div>
              <div className="form-group">
                <label>Tel (En cas d'urgence)</label>
                <input type="text" required value={tel_urgency} onChange={(e) => setUrgency(e.target.value)} />
              </div>
               <div className="form-group">
                <label>Situation matrimoniale</label>
                <select required value={situation} onChange={(e) => setSituation(e.target.value)}>
                  <option value="">Sélectionner</option>
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Domicile</label>
                <input type="text" required value={address} onChange={(e) => setAddresse(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Profession</label>
                <input type="text" required value={profession} onChange={(e) => setProfession(e.target.value)} />
              </div>
              <div className="form-group">
                <label>N° CNI ou PASSEPORT</label>
                <input type="text" required value={pieces} onChange={(e) => setPiece(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date d'émission</label>
                <input type="date" required value={date_emission} onChange={(e) => setEmission(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date d'expiration</label>
                <input type="date" required value={date_expiration} onChange={(e) => setExpiration(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date d'entrée</label>
                <input type="date" required value={date_entrance} onChange={(e) => setDateEntrance(e.target.value)} />
              </div>

              {/* Projet */}
              <div className="form-group">
                <label>Projet</label>
                <select
                  required
                  value={selectedProject}
                  onChange={(e) => { setSelectedProject(e.target.value); setSelectedHome(null); }}
                  className="select-field"
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map((proj) => (
                    <option key={proj._id} value={proj._id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              {/* Biens disponibles */}
              {selectedProject && (
                <div className="form-group">
                  <label>Biens disponibles</label>
                  <select
                    required
                    value={selectedHome?._id || ""}
                    onChange={handleHouseChange}
                    className="select-field"
                  >
                    <option value="">Sélectionner un bien</option>
                    {homes.map((home) => (
                      <option key={home._id} value={home._id}>
                        {home.nameHome} - {home.reference} - {home.categorie}
                      </option>
                    ))}
                  </select>

                  {selectedHome && (
                    <div style={{
                      marginTop: 15,
                      padding: 15,
                      border: "1px solid #ddd",
                      borderRadius: 10,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      background: "#fff",
                    }}>
                      {selectedHome.img && (
                        <img
                          src={selectedHome.img.startsWith("http") ? selectedHome.img : `http://localhost:4000/${selectedHome.img}`}
                          alt={selectedHome.nameHome}
                          style={{ width: 220, height: 150, borderRadius: 8, objectFit: "cover", marginBottom: 10 }}
                        />
                      )}
                      <h4>{selectedHome.nameHome}</h4>
                      <p><strong>Référence:</strong> {selectedHome.reference}</p>
                      <p><strong>Catégorie:</strong> {selectedHome.categorie}</p>
                      <p><strong>Nombre de pièces:</strong> {selectedHome.NmbrePieces || "N/A"}</p>
                      <p><strong>Loyer Mensuel:</strong> {selectedHome.rent ? `${selectedHome.rent.toLocaleString()} FCFA` : "N/A"}</p>
                      <p><strong>Disponibilité:</strong> Libre</p>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CSS intégré --- */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; margin-bottom: 2rem; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .btn-add { background: #2563eb; color: #fff; border: none; padding: .6rem 1.2rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
        .btn-add:hover { background: #1e40af; }
        .filter-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .select-field { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .search-wrapper { position: relative; flex: 1; max-width: 250px; }
        .search-wrapper input { width: 100%; padding: .5rem 2.5rem .5rem .8rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .search-icon { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .table-section { overflow-x: auto; }
        .loading { display: flex; justify-content: center; align-items: center; height: 40vh; }
        .saas-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .saas-table th, .saas-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .saas-table th { background: #f1f5f9; }
        .btn-details { padding: .4rem .8rem; border-radius: 6px; border: none; background: #2563eb; color: #fff; cursor: pointer; }
        .btn-details:hover { background: #1e40af; }
        .pagination { margin-top: 1rem; display: flex; gap: .3rem; justify-content: center; }
        .pagination button { padding: .4rem .8rem; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; background: #fff; }
        .pagination button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
        .pagination button:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>

    </div>
  );
}