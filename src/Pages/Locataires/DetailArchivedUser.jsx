import React,{ useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import toast, { Toaster } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Blocks } from "react-loader-spinner";

export default function DetailArchivedUser({ user, clearUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();

  // États principaux
  const [person, setPerson] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [worksHistory, setWorksHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [homes, setHomes] = useState([]);
  const [persons, setPersons] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  // 🔹 États pour le repli par année (accordion)
const [openYears, setOpenYears] = useState({});

// const toggleYear = (year) => {
//   setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
// };
  // Champs formulaire locataire
  const [typePersonne, setTypePersonne] = useState("particulier");
  const [name, setFullName] = useState("");
  const [lastname, setPrenom] = useState("");
  const [birth, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [nationality, setNationality] = useState("");
  const [sexe, setSexe] = useState("");
  const [tel, setTel] = useState("");
  const [tel_urgency, setUrgency] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [address, setAddresse] = useState("");
  const [city, setCity] = useState("");
  const [situation, setSituation] = useState("");
  const [pieces, setPiece] = useState("");
  const [date_entrance, setDateEntrance] = useState("");
  const [date_emission, setEmission] = useState("");
  const [date_expiration, setExpiration] = useState("");
  const [raisonSociale, setRaisonSociale] = useState("");
  const [rccm, setRCCM] = useState("");
  const [ifu, setIFU] = useState("");
  const [responsable, setResponsable] = useState("");
  const [siegeSocial, setSiegeSocial] = useState("");
  const [domaineActivite, setDomaineActivite] = useState("");
  const [contratBail, setContratBail] = useState("");
  const [payments, setPayments] = useState([]);

  // Modal et sélection projet/biens
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedHome, setSelectedHome] = useState(null);

// const [openYears, setOpenYears] = useState({});
const toggleYear = (year) =>
  setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
// const totalPayments = payments?.length || 0;
// const totalPages = Math.ceil(totalPayments / itemsPerPage);
 // Pagination des paiements
const totalPayments = Array.isArray(payments) ? payments.length : 0;
const totalPages = Math.ceil(totalPayments / itemsPerPage);
const currentPayments = Array.isArray(payments)
  ? payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  : [];

  

  // Impression
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${person.name || person.raisonSociale || ""}`,
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
      setUploadedFiles(data.uploadedFiles || []);
      setWorksHistory(data.worksHistory || []);
      setTypePersonne(data.typePersonne || "particulier");
      setRaisonSociale(data.raisonSociale || "");
      setRCCM(data.rccm || "");
      setIFU(data.ifu || "");
      setResponsable(data.responsable || "");
      setSiegeSocial(data.siegeSocial || "");
      setDomaineActivite(data.domaineActivite || "");
      setContratBail(data.contratBail || "");
        // 🔹 Récupérer les paiements depuis rentalIds
    setPayments(data.rentalIds || []);
    } catch (e) {
      console.error(e);
      toast.error("Impossible de récupérer les données du locataire");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPersonData(); }, [id]);

  // Fetch projets de l’admin
  useEffect(() => {
    if (!user?._id) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:4000/projects/admin/${user._id}`);
        const data = await res.json();
        if (data.success) setProjects(data.projects || []);
      } catch (err) { toast.error("Erreur récupération projets : " + err.message); }
    };
    fetchProjects();
  }, [user]);

  // Fetch locataires de l’admin
  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetch(`http://localhost:4000/locataire/${user._id}`)
      .then(res => res.json())
      .then(setPersons)
      .catch(err => toast.error("Erreur récupération locataires : " + err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Fetch biens disponibles selon projet
  useEffect(() => {
    if (!selectedProject) { setHomes([]); return; }
    const fetchHomes = async () => {
      try {
        const res = await fetch(`http://localhost:4000/projects/${selectedProject}`);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        const availableHomes = Array.isArray(data.homes) ? data.homes.filter(home => !home.personId || home.personId.length === 0) : [];
        setHomes(availableHomes);
      } catch (err) { console.error(err); setHomes([]); }
    };
    fetchHomes();
  }, [selectedProject]);

  const handleHouseChange = (e) => {
    const home = homes.find(h => h._id === e.target.value);
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
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                  body: JSON.stringify({ adminId: person.adminId || person._id }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Erreur duplication");
                toast.success("Locataire dupliqué avec succès !");
                navigate("/users");
              } catch (err) { console.error(err); toast.error("Impossible de dupliquer le locataire"); }
              finally { toast.dismiss(t.id); }
            }}
          >✅ Oui</button>
          <button onClick={() => toast.dismiss(t.id)} style={{ background: "#6b7280", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}>❌ Non</button>
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
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Erreur restauration");
                toast.success("Locataire restauré avec succès !");
                navigate("/users");
              } catch (err) { console.error(err); toast.error("Impossible de restaurer le locataire"); }
              finally { toast.dismiss(t.id); }
            }}
          >✅ Oui</button>
          <button onClick={() => toast.dismiss(t.id)} style={{ background: "#6b7280", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}>❌ Non</button>
        </div>
      </span>
    ), { duration: 50000 });
  };

  // Ajouter locataire
  const handleAddLocataire = async (e) => {
    e.preventDefault();
    if (!selectedProject) { toast.error("⚠️ Sélectionnez un projet avant d’ajouter un locataire"); return; }
    try {
      const payload = { name, lastname, email, homes: selectedHome?._id, adminId: user._id, birth, lieu, nationality, sexe, tel, tel_urgency, profession, address, pieces, date_entrance, date_emission, date_expiration, situation, city, typePersonne, raisonSociale, rccm, ifu, responsable, siegeSocial, domaineActivite, contratBail };
      const res = await fetch("http://localhost:4000/NewLocataire", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) { toast.error(result.message || "Erreur serveur"); return; }
      toast.success("✅ Locataire ajouté avec succès !");
      setShowAddModal(false);
      fetch(`http://localhost:4000/locataire/${user._id}`).then(res => res.json()).then(setPersons);
    } catch (err) { console.error(err); toast.error("Erreur serveur : " + err.message); }
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
                    <h2 className="tenant-title">{typePersonne === "particulier" ? `${person.name} ${person.lastname}` : raisonSociale}</h2>
                    <div>
                      <button className="btn__dup" onClick={() => duplicatePerson(person._id)}>Dupliquer</button>
                      <button className="details__btn btn-restore" onClick={() => restorePerson(person._id)}>Restaurer</button>
                    </div>
                  </div>

                  {/* Informations locataire */}
                  <div className="tenant-section">
                    <h3 className="section-title">Informations</h3>
                    {typePersonne === "particulier" ? (
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
                        <p><span>Ville :</span> {person.city || "N/A"}</p>
                        <p><span>Situation :</span> {person.situation || "N/A"}</p>
                        <p><span>N° CNI/Passeport :</span> {person.pieces || "N/A"}</p>
                        <p><span>Date d'émission :</span> {formatDate(person.date_emission)}</p>
                        <p><span>Date d'expiration :</span> {formatDate(person.date_expiration)}</p>
                        <p><span>Date d'entrée :</span> {formatDate(person.date_entrance)}</p>
                        <p><span>Date de sortie :</span> {formatDate(person.release_date)}</p>
                      </div>
                    ) : (
                      <div className="info-grid">
                        <p><span>Raison sociale :</span> {raisonSociale || "N/A"}</p>
                        <p><span>RCCM :</span> {rccm || "N/A"}</p>
                        <p><span>IFU :</span> {ifu || "N/A"}</p>
                        <p><span>Responsable :</span> {responsable || "N/A"}</p>
                        <p><span>Siège social :</span> {siegeSocial || "N/A"}</p>
                        <p><span>Domaine activité :</span> {domaineActivite || "N/A"}</p>
                        <p><span>Téléphone :</span> {person.tel || "N/A"}</p>
                        <p><span>Email :</span> {person.email || "N/A"}</p>
                        <p><span>Contrat de bail :</span> {contratBail || "N/A"}</p>
                        <p><span>Date d'entrée :</span> {formatDate(person.date_entrance)}</p>
                        <p><span>Date de sortie :</span> {formatDate(person.release_date)}</p>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="tenant-section">
                    <h3 className="section-title">Documents</h3>
                    <div className="info-grid">
                      {uploadedFiles.length === 0 ? <p>Aucun document fourni</p> :
                        uploadedFiles.map(file => (
                          <p key={file._id || file.name}>
                            <span>{file.type || "Document"} :</span>{" "}
                            <a href={`http://localhost:4000/${file.path || file.filePath}`} target="_blank" rel="noopener noreferrer" download>Télécharger</a>
                          </p>
                        ))}
                    </div>
                  </div>

                    {/* Maison attribuée */}
                 <div className="tenant-section">
  <h3 className="section-title">Maison attribuée</h3>
  {person.homeInfo ? (
    <div className="home-card">
      {/* Image principale */}
      {person.homeInfo.img && (
        <div className="home-main-image">
          <img
            src={person.homeInfo.img.startsWith("http") ? person.homeInfo.img : `http://localhost:4000/${person.homeInfo.img}`}
            alt={person.homeInfo.nameHome}
            style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "8px" }}
          />
        </div>
      )}

      {/* Infos principales */}
      <div className="home-info">
        <p><span>Nom :</span> {person.homeInfo.nameHome || "N/A"}</p>
        <p><span>Référence :</span> {person.homeInfo.reference || "N/A"}</p>
        <p><span>Catégorie :</span> {person.homeInfo.categorie || "N/A"}</p>
        <p><span>Adresse :</span> {person.homeInfo.addressHome || "N/A"}</p>
        <p><span>Nombre de pièces :</span> {person.homeInfo.NmbrePieces || "N/A"}</p>
        <p><span>Ville :</span> {person.homeInfo.city || "N/A"}</p>
        <p><span>Quartier :</span> {person.homeInfo.quarter || "N/A"}</p>
        <p><span>Loyer :</span> {person.homeInfo.rent ? `${Number(person.homeInfo.rent).toLocaleString()} FCFA` : "N/A"}</p>
      </div>

      {/* Galerie images secondaires */}
      {Array.isArray(person.homeInfo.images) && person.homeInfo.images.length > 0 && (
        <div className="home-secondary-images">
          <h4>Images supplémentaires</h4>
          <div className="image-gallery">
            {person.homeInfo.images.map((img, idx) => (
              <img
                key={idx}
                src={img.startsWith("http") ? img : `http://localhost:4000/${img}`}
                alt={`Image ${idx + 1}`}
                style={{ width: "150px", height: "100px", objectFit: "cover", borderRadius: "4px", marginRight: "8px", marginBottom: "8px" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <p>Aucune maison attribuée</p>
  )}
</div>



<div className="tenant-section">
  <h3 className="section-title">🛠️ Travaux et demandes de réparation</h3>

  <div className="works-list">
    {worksHistory.length === 0 ? (
      <p>Aucun travail ou demande enregistrée</p>
    ) : (
      worksHistory.map((work, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={work._id || index} className="work-card" style={{ marginBottom: "10px" }}>
            {/* 🔹 En-tête cliquable */}
            <div
              className="work-header"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f3f4f6",
                borderRadius: "6px",
                padding: "10px 12px",
              }}
            >
              <p style={{ fontWeight: "600", margin: 0 }}>
                {work.title || "Travail sans titre"}
              </p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span
                  style={{
                    color:
                      work.status === "Accepté" || work.status === "Terminé"
                        ? "#16a34a"
                        : work.status === "Refusé"
                        ? "#dc2626"
                        : "#f59e0b",
                    fontWeight: "bold",
                  }}
                >
                  {work.status || "En attente"}
                </span>
                <i
                  className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
                  style={{ color: "#2563eb" }}
                ></i>
              </div>
            </div>

            {/* 🔹 Contenu dépliant */}
            {/* 🔹 Contenu dépliant */}
<div
  className="accordion-content"
  style={{
    maxHeight: isOpen ? "600px" : "0",
    overflow: "hidden",
    transition: "max-height 0.3s ease",
    background: "#fff",
    borderRadius: "0 0 8px 8px",
    padding: isOpen ? "10px 15px" : "0 15px",
  }}
>
  {isOpen && (
    <>
      <p><strong>Description :</strong> {work.description || "Aucune description"}</p>

      {work.cost > 0 && (
        <p><strong>Coût :</strong> {Number(work.cost).toLocaleString()} FCFA</p>
      )}

      <p><strong>Date :</strong> {formatDate(work.createdAt)}</p>

      {work.adminResponse && (
        <p><strong>Réponse du propriétaire :</strong> {work.adminResponse}</p>
      )}

      {work.adminComment && (
        <p><strong>Note interne :</strong> {work.adminComment}</p>
      )}

      {work.updatedBy && (
        <p style={{ fontStyle: "italic", fontSize: "14px", marginTop: "3px" }}>
          Réponse donnée par : {work.updatedBy}
        </p>
      )}

      {/* 🖼️ Images jointes */}
      {work.attachments?.length > 0 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
          {work.attachments.map((url, i) => (
            <img
              key={i}
              src={url.startsWith("http") ? url : `http://localhost:4000/${url}`}
              alt={`Pièce jointe ${i + 1}`}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "6px",
                objectFit: "cover",
                border: "1px solid #e5e7eb",
              }}
            />
          ))}
        </div>
      )}

      {/* 📄 Facture PDF */}
      {work.invoice && (
        <div style={{ marginTop: "10px" }}>
          <a
            href={work.invoice.startsWith("http") ? work.invoice : `http://localhost:4000/${work.invoice}`}
            target="_blank"
            rel="noopener noreferrer"
            download
            style={{
              display: "inline-block",
              padding: "6px 12px",
              background: "#2563eb",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            📄 Télécharger la facture
          </a>
        </div>
      )}
    </>
  )}
</div>
          </div>
        );
      })
    )}
  </div>


</div>

{/* === SECTION : Détails des paiements === */}
<div className="tenant-section paiement-section">
  <h3 className="section-title">💳 Détails des paiements</h3>

  <div ref={componentRef} className="table-responsive">
    <table className="table table-paiement">
      <thead>
        <tr>
          <th>Dernière modification</th>
          <th>Heure</th>
          <th>Date paiement</th>
          <th>Mois</th>
          <th>Montant</th>
          <th>Statut</th>
          <th>Mode</th>
          <th>Imprimer</th>
        </tr>
      </thead>

      <tbody>
        {(() => {
          if (!payments || payments.length === 0)
            return (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  Aucun paiement trouvé
                </td>
              </tr>
            );

          // Groupement par année
          const groupedByYear = payments.reduce((groups, rent) => {
            const year = rent.month
              ? new Date(rent.month).getFullYear()
              : "Inconnue";
            if (!groups[year]) groups[year] = [];
            groups[year].push(rent);
            return groups;
          }, {});

          return Object.keys(groupedByYear)
            .sort((a, b) => b - a)
            .map((year) => (
              <React.Fragment key={year}>
                {/* Ligne d’en-tête (année) */}
                <tr
                  className="year-row"
                  onClick={() => toggleYear(year)}
                  style={{
                    cursor: "pointer",
                    background: "#eef2ff",
                    color: "#1e40af",
                    fontWeight: "bold",
                  }}
                >
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    <span
                      className={`arrow ${openYears[year] ? "open" : ""}`}
                      style={{
                        display: "inline-block",
                        transition: "transform 0.3s ease",
                        marginRight: 8,
                      }}
                    >
                      {openYears[year] ? "▼" : "▶"}
                    </span>
                    Paiements de l’année {year}
                  </td>
                </tr>

                {/* Paiements de cette année */}
                {openYears[year] &&
                  [...groupedByYear[year]]
                    .sort((a, b) => new Date(b.month) - new Date(a.month))
                    .map((rental) => (
                      <tr key={rental._id} className="rent-row">
                        {/* Ajout / Modification */}
                        <td className="rent-cell">
                          <div>
                            <i
                              className="fa-solid fa-user-plus"
                              style={{ color: "#2563eb", marginRight: 4 }}
                            ></i>
                            {rental.createdBy
                              ? `Ajouté par : ${rental.createdBy}`
                              : "—"}
                          </div>
                          {rental.updatedBy && (
                            <div>
                              <i
                                className="fa-solid fa-user-pen"
                                style={{ color: "#16a34a", marginRight: 4 }}
                              ></i>
                              Modifié par : {rental.updatedBy}
                            </div>
                          )}
                        </td>

                        {/* Heure */}
                        <td>
                          {rental.time
                            ? new Date(`1970-01-01T${rental.time}`).toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "N/A"}
                        </td>

                        {/* Date paiement */}
                        <td>
                          {rental.date_of_payment
                            ? new Date(
                                rental.date_of_payment
                              ).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </td>

                        {/* Mois concerné */}
                        <td>
                          {rental.month
                            ? new Date(rental.month).toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>

                        {/* Montant */}
                        <td>
                          {rental.amount
                            ? `${Number(rental.amount).toLocaleString()} FCFA`
                            : "N/A"}
                        </td>

                        {/* Statut */}
                        <td>
                          <span
                            style={{
                              color:
                                rental.status === "Payé"
                                  ? "#16a34a"
                                  : rental.status === "En attente"
                                  ? "#f59e0b"
                                  : "#dc2626",
                              fontWeight: "600",
                            }}
                          >
                            {rental.status || "N/A"}
                          </span>
                        </td>

                        {/* Mode */}
                        <td>{rental.mode || "N/A"}</td>

                     

                        {/* Impression */}
                        <td>
                          <Link to={`/receipt/${rental._id}`}>
                            <i className="fa-solid fa-print"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
              </React.Fragment>
            ));
        })()}
      </tbody>
    </table>
  </div>

  {/* === Pagination === */}
  {totalPages > 1 && (
    <div className="pagination">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Précédent
      </button>
      {Array.from({ length: totalPages }, (_, idx) => (
        <button
          key={idx + 1}
          className={currentPage === idx + 1 ? "active" : ""}
          onClick={() => setCurrentPage(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}
      <button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage === totalPages}
      >
        Suivant
      </button>
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
 <style>{`
       .section {
  margin-top: 20px;
}

.table-paiement th {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
}

.table-paiement tr:hover {
  background: #f3f4f6;
}

.year-row {
  transition: background 0.3s;
}

.paiement-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.btn-add {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}

.btn-add:hover {
  background: #1d4ed8;
}
      `}</style>
    </div>
  );
}