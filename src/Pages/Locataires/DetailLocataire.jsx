import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useReactToPrint } from "react-to-print";
import NavbarLoc from "./NavbarLoc";
import Footer from "../Footer";

export default function DetailLocataire() {
  const { id } = useParams();
  const [person, setPerson] = useState({ homeId: {}, rentals: [] });
  const [works, setWorks] = useState([]);
  const [documents, setDocuments] = useState({ CNI: null, Contrat: null });
  const [loading, setLoading] = useState(true);
  const [openYears, setOpenYears] = useState({});
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [workForm, setWorkForm] = useState({
    title: "",
    description: "",
    attachments: [],
  });

  const componentRef = useRef();

  // ✅ Ouvre / ferme le modal
  const toggleModal = () => setShowWorkModal((prev) => !prev);

  // ✅ Gestion du changement d’image
  const handleFileChange = (e) => {
    setWorkForm({ ...workForm, attachments: Array.from(e.target.files) });
  };

  // ✅ Envoi de la notification de réparation
  const handleSubmitWork = async (e) => {
    e.preventDefault();

    if (!workForm.title.trim()) {
      toast.warning("Veuillez indiquer un titre du problème.");
      return;
    }

    const formData = new FormData();
      formData.append("personId", id);
      formData.append("homeId", person?.homeId?._id);
      formData.append("adminId", person?.homeId?.ownerId);
      formData.append("title", workForm.title);
      formData.append("description", workForm.description);
      formData.append("createdBy", `${person?.name || ""} ${person?.prenom || ""}`.trim());
      workForm.attachments.forEach((file) => formData.append("attachments", file));

    try {
      const res = await fetch(`http://localhost:4000/works/report`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Votre demande de réparation a été envoyée ✅");
        setShowWorkModal(false);
        setWorkForm({ title: "", description: "", attachments: [] });
      } else {
        toast.error(data.message || "Erreur lors de l’envoi de la demande.");
      }
    } catch (err) {
      console.error("Erreur envoi réparation:", err);
      toast.error("Erreur serveur lors de l’envoi.");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: person.name || "Détails locataire",
  });

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleDateString("fr-FR");
  };

  const toggleYear = (year) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  // 🔹 Récupération loyers payés
  const fetchRents = async () => {
    try {
      const res = await fetch(`http://localhost:4000/rents/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPerson((prev) => ({ ...prev, rentals: data.rents || [] }));
      } else {
        setPerson((prev) => ({ ...prev, rentals: [] }));
      }
    } catch (err) {
      console.error("Erreur fetchRents:", err);
      toast.error("Impossible de récupérer les loyers du locataire");
    }
  };

const fetchWorks = async () => {
  try {
    const res = await fetch(`http://localhost:4000/works/locataire/${id}`);
    const data = await res.json();
    if (res.ok && data.success) setWorks(data.works || []);
  } catch (err) {
    console.error("Erreur fetchWorks:", err);
    toast.error("Erreur serveur lors du chargement des travaux");
  }
};

  // 🔹 Récupération des données principales du locataire
  const fetchPersonData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/detail/locataire/${id}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : { homeId: {}, rentals: [] };
      setPerson(data);

      // Documents
      const docRes = await fetch(`http://localhost:4000/locataire/${id}/documents`);
      if (docRes.ok) {
        const docData = await docRes.json();
        if (docData.success && docData.documents) setDocuments(docData.documents);
      }

      await fetchRents();
      await fetchWorks();
    } catch (err) {
      console.error("Erreur fetchPersonData:", err);
      toast.error("Impossible de récupérer les données du locataire");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPersonData();
  }, [id]);

  const confirmDeleteWork = (workId) => {
  toast((t) => (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontWeight: "bold" }}>⚠️ Voulez-vous vraiment supprimer ce travail ?</p>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "15px" }}>
        <button
          style={{
            background: "#ef4444",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "5px",
            fontWeight: "bold"
          }}
          onClick={async () => {
            try {
              const res = await fetch(`https://backend-ged-immo.onrender.com/works/${workId}`, {
                method: "DELETE",
              });
              const data = await res.json();

              if (res.ok && data.success) {
                setWorks((prev) => prev.filter((w) => w._id !== workId));
                toast.success("✅ Travail supprimé !");
              } else {
                toast.error(data.message || "Erreur lors de la suppression");
              }
            } catch (err) {
              console.error("Erreur suppression:", err);
              toast.error("Erreur serveur");
            }
            toast.dismiss(t.id);
          }}
        >
          Oui, supprimer
        </button>

        <button
          style={{
            background: "#6b7280",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "5px",
            fontWeight: "bold"
          }}
          onClick={() => toast.dismiss(t.id)}
        >
          Annuler
        </button>
      </div>
    </div>
  ), { duration: 8000 });
};

  return (
    <div>
      <NavbarLoc />
      <div className="detail-container">
        {loading ? (
          <p className="loading">Chargement des informations...</p>
        ) : (
          <div className="detail-wrapper" ref={componentRef}>
            <h2 className="title">
              {person.typePersonne === "particulier"
                ? `${person.name || ""} ${person.lastname || ""}`
                : person.raisonSociale || "Société N/A"}
            </h2>

            {/* Informations personnelles ou société */}
            <div className="section">
              <h3>Informations {person.typePersonne === "particulier" ? "personnelles" : "société"}</h3>
              <div className="info-grid">
                {person.typePersonne === "particulier" ? (
                  <>
                    <p><strong>Nom :</strong> {person.name || "N/A"}</p>
                    <p><strong>Prénom :</strong> {person.lastname || "N/A"}</p>
                    <p><strong>Date de naissance :</strong> {formatDate(person.birth)}</p>
                    <p><strong>Lieu :</strong> {person.lieu || "N/A"}</p>
                    <p><strong>Sexe :</strong> {person.sexe || "N/A"}</p>
                    <p><strong>Profession :</strong> {person.profession || "N/A"}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Raison sociale :</strong> {person.raisonSociale || "N/A"}</p>
                    <p><strong>Responsable :</strong> {person.responsable || "N/A"}</p>
                    <p><strong>RCCM :</strong> {person.rccm || "N/A"}</p>
                    <p><strong>IFU :</strong> {person.ifu || "N/A"}</p>
                    <p><strong>Domaine activité :</strong> {person.domaineActivite || "N/A"}</p>
                    <p><strong>Siège social :</strong> {person.siegeSocial || "N/A"}</p>
                  </>
                )}

                {/* Champs communs */}
                <p><strong>Téléphone :</strong> {person.tel || "N/A"}</p>
                <p><strong>Email :</strong> {person.email || "N/A"}</p>
                <p><strong>Adresse :</strong> {person.address || "N/A"}</p>
                <p><strong>Ville :</strong> {person.city || "N/A"}</p>
                <p><strong>Pièce(s) d'identité(s) :</strong> {person.pieces || "N/A"}</p>
                <p><strong>Date émission :</strong> {formatDate(person.date_emission)}</p>
                <p><strong>Date expiration :</strong> {formatDate(person.date_expiration)}</p>
                <p><strong>Date entrée :</strong> {formatDate(person.date_entrance)}</p>
                <p><strong>Date sortie :</strong> {person.release_date || "N/A"}</p>
              </div>
            </div>

            {/* Logement */}
            <div className="section">
              <h3>Logement attribué</h3>
              {person.homeId ? (
                <div className="home-card">
                  <div className="images">
                    {person.homeId.img && <img src={person.homeId.img.startsWith("http") ? person.homeId.img : `http://localhost:4000/${person.homeId.img}`} alt="Maison principale" />}
                    {Array.isArray(person.homeId.images) && person.homeId.images.map((url, i) => (
                      <img key={i} src={url.startsWith("http") ? url : `http://localhost:4000/${url}`} alt={`Image ${i}`} />
                    ))}
                  </div>
                  <div className="home-info">
                    <p><strong>Nom :</strong> {person.homeId.nameHome || "N/A"}</p>
                    <p><strong>Référence :</strong> {person.homeId.reference || "N/A"}</p>
                    <p><strong>Type :</strong> {person.homeId.categorie || "N/A"}</p>
                    <p><strong>Adresse :</strong> {person.homeId.addressHome || "N/A"}</p>
                    <p><strong>Ville :</strong> {person.homeId.city || "N/A"}</p>
                    <p><strong>Nombre de pièces :</strong> {person.homeId.NmbrePieces || "N/A"}</p>
                    <p><strong>Loyer :</strong> {person.homeId.rent ? `${person.homeId.rent.toLocaleString()} FCFA` : "N/A"}</p>
                    <p><strong>Caution :</strong> {person.homeId.guarantee ? `${person.homeId.guarantee.toLocaleString()} FCFA` : "N/A"}</p>
                    <p><strong>Description :</strong> {person.homeId.description || "Aucune"}</p>
                  </div>
                </div>
              ) : (
                <p>Aucun logement attribué</p>
              )}
            </div>

            {/* Accès */}
            <div className="tenant-section">
              <h3 className="section-title">Accès</h3>
              <div className="info-grid">
                <p><span>Username :</span> {person.username || "N/A"}</p>
                <p><span>Password :</span> {person.password || "N/A"}</p>
              </div>
            </div>

                {/* Paiements */}
            <div className="section">
              <h3>Historique des paiements</h3>
              {person.rentals && person.rentals.length > 0 ? (
              <table className="table">
  <thead>
    <tr>
      <th>📅 Date de paiement</th>
      <th>🗓️ Mois</th>
      <th>💰 Montant</th>
      <th>💳 Mode</th>
      <th>📄 Statut</th>
      <th>🔢 N° Reçu</th>
      <th>🖨️ Action</th>
    </tr>
  </thead>
  <tbody>
    {(() => {
      const groupedByYear = person.rentals.reduce((groups, rent) => {
        const year = rent.month ? new Date(rent.month).getFullYear() : "Inconnue";
        if (!groups[year]) groups[year] = [];
        groups[year].push(rent);
        return groups;
      }, {});

      return Object.keys(groupedByYear)
        .sort((a, b) => b - a)
        .map((year) => (
          <React.Fragment key={year}>
            {/* --- Ligne d’en-tête de l’année --- */}
            <tr
              onClick={() => toggleYear(year)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                background: "#f0f4ff",
                color: "#2563eb",
              }}
            >
              <td colSpan={7}>
                {openYears[year] ? "▼" : "▶"} Paiements de l’année {year}
              </td>
            </tr>

            {/* --- Paiements de l’année --- */}
            {openYears[year] &&
              groupedByYear[year]
                .sort((a, b) => new Date(b.month) - new Date(a.month))
                .map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.date_of_payment
                        ? new Date(r.date_of_payment).toLocaleDateString("fr-FR")
                        : "N/A"}
                    </td>
                    <td>
                      {r.month
                        ? new Date(r.month).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td>{r.amount ? `${r.amount.toLocaleString()} FCFA` : "N/A"}</td>
                    <td>{r.mode || "N/A"}</td>
                    <td>{r.status || "N/A"}</td>
                    <td>
                      <strong style={{ color: "#2563eb" }}>
                        {r.receipt_number || r.numero_recu || "—"}
                      </strong>
                    </td>
                    <td>
                      <Link
                        to={`/Mon__recu/fr/${r._id}`}
                        title="Imprimer le reçu"
                      >
                        <i
                          className="fa-solid fa-print"
                          style={{ color: "#4f46e5" }}
                        ></i>
                      </Link>
                    </td>
                  </tr>
                ))}
          </React.Fragment>
        ));
    })()}
  </tbody>
</table>
              ) : <p>Aucun paiement trouvé</p>}
            </div>

            {/* Documents */}
            <div className="section">
              <h3>Documents</h3>
              <div className="doc-grid">
                <p><strong>Carte d’identité :</strong> {documents.CNI ? <a href={`http://localhost:4000/${documents.CNI}`} target="_blank">Voir</a> : "Aucun document"}</p>
                <p><strong>Contrat de bail :</strong> {documents.Contrat ? <a href={`http://localhost:4000/${documents.Contrat}`} target="_blank">Voir</a> : "Aucun document"}</p>
              </div>
            </div>

{/* 🔹 Travaux et demandes de réparation */}
 <div className="tenant-section">
      <h3 className="section-title">🛠️ Travaux et demandes de réparation</h3>

      <div className="works-list">
        {works.length === 0 ? (
          <p>Aucun travail ou demande enregistrée</p>
        ) : (
          works.map((work, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={work._id} className="work-card">
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
                      className={`fa-solid ${
                        isOpen ? "fa-chevron-up" : "fa-chevron-down"
                      }`}
                      style={{ color: "#2563eb" }}
                    ></i>
                  </div>
                </div>

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
                      <p>
                        <strong>Description :</strong>{" "}
                        {work.description || "Aucune description"}
                      </p>

                      {work.cost > 0 && (
                        <p>
                          <strong>Coût :</strong>{" "}
                          {work.cost.toLocaleString()} FCFA
                        </p>
                      )}

                      <p>
                        <strong>Date :</strong> {formatDate(work.createdAt)}
                      </p>

                      {work.adminResponse && (
                        <p>
                          <strong>Réponse du propriétaire :</strong>{" "}
                          {work.adminResponse}
                        </p>
                      )}

                      {work.adminComment && (
                        <p>
                          <strong>Note interne :</strong> {work.adminComment}
                        </p>
                      )}

                      {/* 🖼️ Images jointes */}
                      {work.attachments?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "8px",
                          }}
                        >
                          {work.attachments.map((url, i) => (
                            <img
                              key={i}
                              src={
                                url.startsWith("http")
                                  ? url
                                  : `http://localhost:4000/${url}`
                              }
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
                            href={
                              work.invoice.startsWith("http")
                                ? work.invoice
                                : `http://localhost:4000/${work.invoice}`
                            }
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

                      {/* 🗑️ Bouton suppression */}
                      {/* <button
                        onClick={() => confirmDeleteWork(work._id)}
                        style={{
                          marginTop: "12px",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Supprimer
                      </button> */}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🔹 BOUTON SIGNALER UN PROBLÈME */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={toggleModal}
            style={{
              background: "#dc2626",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🚧 Signaler un problème / réparation
          </button>
        </div>
    </div>

        


        {/* 🔹 BOUTON SIGNALER UN PROBLÈME */}
        {/* <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={toggleModal}
            style={{
              background: "#dc2626",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🚧 Signaler un problème / réparation
          </button>
        </div> */}

        {/* 🔹 MODAL DE SIGNALISATION */}
        {showWorkModal && (
          <div className="modal-overlay-repairs">
            <div className="modal-repairs">
              <h3>🛠️ Nouvelle demande de réparation</h3>
              <form onSubmit={handleSubmitWork}>
                <div className="form-group">
                  <label>Titre du problème :</label>
                  <input
                    type="text"
                    value={workForm.title}
                    onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description :</label>
                  <textarea
                    rows="4"
                    value={workForm.description}
                    onChange={(e) =>
                      setWorkForm({ ...workForm, description: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Ajouter des photos (max 3) :</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <div className="preview-container">
                    {workForm.attachments.length > 0 &&
                      workForm.attachments.map((file, i) => (
                        <img
                          key={i}
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginRight: "10px",
                          }}
                        />
                      ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={toggleModal} className="cancel-btn">
                    Annuler
                  </button>
                  <button type="submit" className="submit-btn">
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

            <button className="print-btn" onClick={handlePrint}>🖨️ Imprimer</button>
          </div>
        )}
      </div>
      <Footer />

      <style>{`
        .detail-container { padding: 2rem; background: #f8fafc; }
        .detail-wrapper { background: #fff; border-radius: 10px; padding: 2rem; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .title { color: #1e3a8a; margin-bottom: 20px; }
        .section { margin-bottom: 2rem; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
        .info-grid p { background: #f9fafb; padding: 8px; border-radius: 5px; }
        .home-card { display: flex; flex-wrap: wrap; gap: 1rem; }
        .home-card img { width: 150px; height: 150px; border-radius: 6px; object-fit: cover; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        .works-list { display: grid; gap: 10px; }
        .work-card { background: #f9f9f9; padding: 10px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .print-btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
        .modal-overlay-repairs {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-repairs {
          background: white;
          padding: 20px;
          border-radius: 10px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 5px; font-weight: 600; }
        .form-group input, .form-group textarea {
          border: 1px solid #ccc; border-radius: 6px; padding: 8px;
        }
        .modal-actions {
          display: flex; justify-content: flex-end; gap: 10px;
        }
        .cancel-btn {
          background: #6b7280; color: white; border: none; border-radius: 5px; padding: 8px 12px;
        }
        .submit-btn {
          background: #2563eb; color: white; border: none; border-radius: 5px; padding: 8px 12px;
        }
      `}</style>
    </div>
  );
}