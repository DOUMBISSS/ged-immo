import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Pages/Navbar";
import Footer from "../Pages/Footer";
import toast, { Toaster } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Blocks } from "react-loader-spinner";

export default function DetailArchivedUser({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();

  // Etats
  const [person, setPerson] = useState({ archivedHomeInfo: {}, rentalIds: [] });
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [homes, setHomes] = useState([]);
  const [persons, setPersons] = useState([]);

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedHome, setSelectedHome] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination paiements
  const totalRentals = Array.isArray(person.rentalIds) ? person.rentalIds.length : 0;
  const totalPages = Math.ceil(totalRentals / itemsPerPage);
  const currentRentals = Array.isArray(person.rentalIds)
    ? person.rentalIds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  // Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${person.name || ""} ${person.lastname || ""}`,
  });

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Fetch locataire archivé
  const fetchPersonData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/archives/locataire/${id}`);
      if (!res.ok) throw new Error("Erreur récupération locataire");
      const data = await res.json();
      setPerson(data);
      setDocuments(data.documents || {});
    } catch (e) {
      console.error("Erreur fetchPersonData:", e);
      toast.error("Impossible de récupérer les données du locataire");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonData();
  }, [id]);

  // Fetch projets de l'admin
  useEffect(() => {
    if (!user?._id) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:4000/projects/admin/${user._id}`);
        const data = await res.json();
        if (data.success) setProjects(data.projects || []);
      } catch (err) {
        toast.error("Erreur récupération projets/maisons : " + err.message);
      }
    };
    fetchProjects();
  }, [user]);

  // Fetch locataires liés à l'admin
  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetch(`http://localhost:4000/locataire/${user._id}`)
      .then(res => res.json())
      .then(data => setPersons(data))
      .catch(err => toast.error("Erreur récupération locataires : " + err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Fetch biens disponibles selon projet
  useEffect(() => {
    if (!selectedProject) {
      setHomes([]);
      return;
    }
    const fetchHomes = async () => {
      try {
        const res = await fetch(`http://localhost:4000/projects/${selectedProject}`);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        const availableHomes = Array.isArray(data.homes)
          ? data.homes.filter(home => !home.personId || home.personId.length === 0)
          : [];
        setHomes(availableHomes);
      } catch (err) {
        console.error("Erreur récupération biens :", err);
        setHomes([]);
      }
    };
    fetchHomes();
  }, [selectedProject]);

    const handleHouseChange = (e) => {
    const selectedId = e.target.value;
    const home = homes.find((h) => h._id === selectedId);
    setSelectedHome(home || null);
  };

  // Duplication locataire
  const duplicatePerson = (personId) => {
    toast((t) => (
      <span>
        Voulez-vous dupliquer ce locataire ?
        <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
          <button
            style={{ background: "#2563eb", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}
            onClick={async () => {
              try {
                const res = await fetch(`http://localhost:4000/persons/${personId}/duplicate`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ adminId: person.adminId || person._id }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Erreur duplication");
                toast.success("Locataire dupliqué avec succès !");
                navigate("/users");
              } catch (err) {
                console.error(err);
                toast.error("Impossible de dupliquer le locataire");
              } finally {
                toast.dismiss(t.id);
              }
            }}
          >
            ✅ Oui
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "#6b7280", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}
          >
            ❌ Non
          </button>
        </div>
      </span>
    ), { duration: 50000 });
  };

  // Restaurer locataire
  const restorePerson = (personId) => {
    toast((t) => (
      <span>
        Voulez-vous vraiment restaurer ce locataire ?
        <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
          <button
            style={{ background: "#ef4444", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}
            onClick={async () => {
              try {
                const res = await fetch(`http://localhost:4000/persons/${personId}/restore`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Erreur restauration");
                toast.success("Locataire restauré avec succès !");
                navigate("/users");
              } catch (err) {
                console.error(err);
                toast.error("Impossible de restaurer le locataire");
              } finally {
                toast.dismiss(t.id);
              }
            }}
          >
            ✅ Oui
          </button>
          <button onClick={() => toast.dismiss(t.id)} style={{ background: "#6b7280", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}>
            ❌ Non
          </button>
        </div>
      </span>
    ), { duration: 50000 });
  };

  // Ajouter locataire
  const handleAddLocataire = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      toast.error("⚠️ Sélectionnez un projet avant d’ajouter un locataire");
      return;
    }
    try {
      const payload = {
        name,
        lastname,
        email,
        homes: selectedHome?._id,
        adminId: user._id,
        birth,
        lieu,
        nationality,
        sexe,
        tel,
        tel_urgency,
        profession,
        address,
        pieces,
        date_entrance,
        date_emission,
        date_expiration,
        situation,
        city,
      };
      const res = await fetch("http://localhost:4000/NewLocataire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("Réponse backend /NewLocataire:", result);

      if (!res.ok) {
        toast.error(`Erreur serveur (${res.status}) : ${result.message || "Vérifiez les champs"}`);
        return;
      }
      if (result.success) {
        toast.success("✅ Locataire ajouté avec succès !");
        setShowAddModal(false);
        fetch(`http://localhost:4000/locataire/${user._id}`)
          .then(res => res.json())
          .then(setPersons)
          .catch(err => console.error("Erreur rafraîchissement :", err));
      } else {
        toast.error(result.message || "Impossible d’ajouter le locataire");
      }
    } catch (err) {
      console.error("Erreur inattendue :", err);
      toast.error("Erreur serveur : " + err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right">
            {loading ? (
              <Blocks height="80" width="100%" color="#4fa94d" ariaLabel="loading" radius="1" visible={true} />
            ) : (
              <div className="detail-user-wrapper">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/Mes__archives">Home</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Détails du profil</li>
                  </ol>
                </nav>

                {/* Header */}
                <div className="tenant-card">
                  <div className="tenant-header">
                    <h2 className="tenant-title">{person.name} {person.lastname}</h2>
                    <div>
                      <button className="btn__dup" onClick={() => duplicatePerson(person._id)}>Dupliquer</button>
                      <button className="details__btn btn-restore" onClick={() => restorePerson(person._id)}>Restaurer</button>
                    </div>
                  </div>

                  {/* Infos personnelles */}
                  <div className="tenant-section">
                    <h3 className="section-title">Informations personnelles</h3>
                    <div className="info-grid">
                      <p><span>Nom :</span> {person.name || "N/A"}</p>
                      <p><span>Prénom :</span> {person.lastname || "N/A"}</p>
                      <p><span>Date de naissance :</span> {formatDate(person.birth)}</p>
                      <p><span>Sexe :</span> {person.sexe || "N/A"}</p>
                      <p><span>Nationalité :</span> {person.nationality || "N/A"}</p>
                      <p><span>Téléphone :</span> {person.tel || "N/A"}</p>
                      <p><span>Email :</span> {person.email || "N/A"}</p>
                      <p><span>Profession :</span> {person.profession || "N/A"}</p>
                      <p><span>Domicile :</span> {person.address || "N/A"}</p>
                    </div>
                  </div>

                  {/* Pièces d'identité */}
                  <div className="tenant-section">
                    <h3 className="section-title">Pièce d'identité</h3>
                    <div className="info-grid">
                      <p><span>N° CNI/PAS :</span> {person.pieces || "N/A"}</p>
                      <p><span>Date d’émission :</span> {formatDate(person.date_emission)}</p>
                      <p><span>Date d’expiration :</span> {formatDate(person.date_expiration)}</p>
                      <p><span>Date d'entrée :</span> {formatDate(person.date_entrance)}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="tenant-section">
                    <h3 className="section-title">Documents</h3>
                    <div className="info-grid">
                      {Object.keys(documents).length === 0 ? (
                        <p>Aucun document fourni</p>
                      ) : (
                        Object.entries(documents).map(([type, doc]) =>
                          doc ? (
                            <p key={doc._id}>
                              <span>{type} :</span>{" "}
                              <a
                                href={`http://localhost:4000/${doc.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-download"
                                download
                              >
                                Télécharger
                              </a>
                            </p>
                          ) : (
                            <p key={type}><span>{type} :</span> Non fourni</p>
                          )
                        )
                      )}
                    </div>
                  </div>

                  {/* <p>Archivé par : {archive.createdBy}</p> */}

                  {/* Historique logements */}
                  <div className="tenant-section">
                    <h3 className="section-title">Historique des logements attribués</h3>
                    {person.homeInfo && person.homeInfo.nameHome ? (
                      <div className="homes-list">
                        <div className="home-card" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                          <div className="home-images" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {person.homeInfo.img && (
                              <img
                                src={person.homeInfo.img.startsWith('http') ? person.homeInfo.img : `http://localhost:4000/${person.homeInfo.img}`}
                                alt="Image principale"
                                style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: '8px' }}
                              />
                            )}
                            {Array.isArray(person.homeInfo.images) && person.homeInfo.images.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {person.homeInfo.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img.startsWith('http') ? img : `http://localhost:4000/${img}`}
                                    alt={`Image secondaire ${idx + 1}`}
                                    style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: '5px' }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="home-info" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <p><span>Nom :</span> {person.homeInfo.nameHome || "N/A"}</p>
                            <p><span>Référence :</span> {person.homeInfo.reference || "N/A"}</p>
                            <p><span>Type :</span> {person.homeInfo.categorie || "N/A"}</p>
                            <p><span>Adresse :</span> {person.homeInfo.addressHome || "N/A"}</p>
                            <p><span>Quartier :</span> {person.homeInfo.quarter || "N/A"}</p>
                            <p><span>Ville :</span> {person.homeInfo.city || "N/A"}</p>
                            <p><span>Nombre de pièces :</span> {person.homeInfo.NmbrePieces || "N/A"}</p>
                            <p><span>Loyer :</span> {person.homeInfo.rent ? `${Number(person.homeInfo.rent).toLocaleString()} FCFA` : "N/A"}</p>
                            <p><span>Caution :</span> {person.homeInfo.guarantee ? `${Number(person.homeInfo.guarantee).toLocaleString()} FCFA` : "N/A"}</p>
                            <p><span>Observations :</span> {person.homeInfo.observations || "Aucune observation"}</p>
                            <p><span>Date de sortie :</span> {person.release_date ? new Date(person.release_date).toLocaleDateString("fr-FR") : "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="no-home">Aucun logement archivés</p>
                    )}
                  </div>

                  {/* Paiements */}
                  <div className="tenant-section paiement-section">
                    <h3 className="section-title">Détails des paiements</h3>
                    {/* <Link to={`/archivedetail/${person._id}`}>
                      <button className="btn-all">Voir tous les paiements &gt;&gt;</button>
                    </Link> */}
                    <div ref={componentRef} className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Heures</th>
                            <th>Date paiement</th>
                            <th>Mois</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th>Mode</th>
                            <th>Imprimer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRentals.length > 0 ? (
                            currentRentals.map((rental) => (
                              <tr key={rental._id}>
                                <td>{rental.time || "N/A"}</td>
                                <td>{rental.date_of_payment ? new Date(rental.date_of_payment).toLocaleDateString("fr-FR") : "N/A"}</td>
                                <td>{rental.month ? new Date(rental.month).toLocaleString("default", { month: "long" }) : "N/A"}</td>
                                <td>{person.archivedHomeInfo?.rent ? `${Number(person.archivedHomeInfo.rent).toLocaleString()} FCFA` : "N/A"}</td>
                                <td>{rental.status || "N/A"}</td>
                                <td>{rental.mode || "N/A"}</td>
                                <td><Link to={`/receipt/${rental._id}`}><i className="fa-solid fa-print"></i></Link></td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="7">Aucun paiement trouvé</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Précédent</button>
                        {Array.from({ length: totalPages }, (_, idx) => (
                          <button key={idx + 1} className={currentPage === idx + 1 ? "active" : ""} onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                        ))}
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Suivant</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Toaster position="top-right" reverseOrder={false} />
      </div>
      <Footer />

      {showAddModal && (
  <div className="modal-container">
    <div className="modal-contents">
      <div className="modal-header">
        <h2><i className="fa-solid fa-user-plus"></i> Ajouter un nouveau locataire</h2>
        <button className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
      </div>

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
          <label>Tel(WhatsApp)</label>
          <input type="text" required value={tel} onChange={(e) => setTel(e.target.value)} />
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

        {/* Projet et biens disponibles */}
        <div className="form-group">
          <label>Projet</label>
          <select
            required
            value={selectedProject}
            onChange={(e) => { setSelectedProject(e.target.value); setSelectedHome(null); }}
          >
            <option value="">Sélectionner un projet</option>
            {projects.map(proj => (
              <option key={proj._id} value={proj._id}>{proj.name}</option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <div className="form-group">
            <label>Biens disponibles</label>
            <select
              required
              value={selectedHome?._id || ""}
              onChange={handleHouseChange}
            >
              <option value="">Sélectionner un bien</option>
              {homes.map(home => (
                <option key={home._id} value={home._id}>
                  {home.nameHome} - {home.reference} - {home.categorie}
                </option>
              ))}
            </select>

            {selectedHome && (
              <div className="home-preview">
                {selectedHome.img && (
                  <img
                    src={selectedHome.img.startsWith("http") ? selectedHome.img : `http://localhost:4000/${selectedHome.img}`}
                    alt={selectedHome.nameHome}
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
    </div>
  );
}