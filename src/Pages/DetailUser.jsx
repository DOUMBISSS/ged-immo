import { useState, useEffect, useRef } from "react";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast, { Toaster } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Blocks } from "react-loader-spinner";
import { useUserContext } from "../contexts/UserContext";
import UploadDocument from "./UploadDocument";
import ContractModal from "./Contrat/ContractModal";
import UpdateProfilModal from "../Locataires/UpdateProfilModal";


export default function DetailUser() {
  const { user,clearUser } = useUserContext();
  const { id } = useParams();
  const [person, setPerson] = useState({ home_id: [], rentals: [] });
 const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteRentModal, setDeleteRentModal] = useState({ open: false, rentId: null });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
   const [showContractModal, setShowContractModal] = useState(false);
    const [contract, setContract] = useState(null); // 🔹 contrat du locataire
    const [showEditModal, setShowEditModal] = useState(false);
const [selectedRent, setSelectedRent] = useState(null);
const [loadingContract, setLoadingContract] = useState(true);

  // Paiement
  const [date_of_payment, setDate] = useState("");
  const [time, setTime] = useState("");
  const [month, setMonth] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const componentRef = useRef();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const totalRentals = Array.isArray(person.rentals) ? person.rentals.length : 0;
  const totalPages = Math.ceil(totalRentals / itemsPerPage);

  // Travaux maison
const [works, setWorks] = useState([]); // travaux existants
const [showWorkModal, setShowWorkModal] = useState(false);

// Formulaire ajout travail
const [workTitle, setWorkTitle] = useState("");
const [workDescription, setWorkDescription] = useState("");
const [workCost, setWorkCost] = useState("");
const [workDate, setWorkDate] = useState("");
const [showDocumentModal, setShowDocumentModal] = useState(false);
 const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${person.name || ""} ${person.prenom || ""}`,
  });

  // 🔹 Récupération loyers payés
  const fetchRents = async () => {
    try {
      const res = await fetch(`http://localhost:4000/rents/${id}`);
      if (!res.ok) throw new Error("Erreur récupération loyers");

      const data = await res.json();
      if (data.success) {
        setPerson(prev => ({
          ...prev,
          rentals: data.rents || []
        }));
      } else {
        setPerson(prev => ({ ...prev, rentals: [] }));
      }
    } catch (err) {
      console.error("Erreur fetchRents:", err);
      toast.error("Impossible de récupérer les loyers du locataire");
    }
  };

  // 🔹 Récupération données locataire
  const fetchPersonData = async () => {
    setLoading(true);
    try {
      // 🔹 Récupération locataire
      const res = await fetch(`http://localhost:4000/detail/locataire/${id}`);
      if (!res.ok) throw new Error("Erreur récupération locataire");

      const text = await res.text();
      const data = text ? JSON.parse(text) : { home_id: [], rentals: [] };
      setPerson(data);

      // 🔹 Récupération documents
      const docRes = await fetch(`http://localhost:4000/locataire/${id}/documents`);
      if (docRes.ok) {
        const docData = await docRes.json();
        if (docData.success && docData.documents) {
          setDocuments(docData.documents);
        } else {
          setDocuments({ CNI: null, Contrat: null });
        }
      }

      // 🔹 Récupération loyers payés
      await fetchRents();

    } catch (e) {
      console.error("Erreur fetchPersonData:", e);
      toast.error("Impossible de récupérer les données du locataire");
    } finally {
      setLoading(false);
    }
  };


 // 🔹 Charger les travaux existants du locataire
  const fetchWorks = async () => {
    try {
      const res = await fetch(`http://localhost:4000/works/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setWorks(data.works || []);
      } else {
        toast.error(data.message || "Erreur lors du chargement des travaux");
      }
    } catch (err) {
      console.error("Erreur fetch works:", err);
      toast.error("Erreur serveur lors du chargement des travaux");
    }
  };

  useEffect(() => {
    fetchPersonData();
    fetchWorks();
  }, [id]);
  
 

// 🔹 Archiver un locataire avec confirmation
const handleArchive = async (id) => {
  if (!user?.token) {
    toast.error("🔒 Vous devez être connecté pour archiver un locataire.");
    navigate("/");
    return;
  }

  toast((t) => (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontWeight: "bold" }}>⚠️ Voulez-vous vraiment archiver ce locataire ?</p>
      <p style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>
        Cette action est irréversible !
      </p>
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
              const res = await fetch(`http://localhost:4000/locataire/${id}/archive`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${user.token}`,
                },
              });

              let data;
              try {
                data = await res.json();
              } catch {
                data = {};
              }

              if (!res.ok) {
                if (data.message?.toLowerCase().includes("token") || data.message?.toLowerCase().includes("expiré")) {
                  toast.error("🔑 Session expirée, veuillez vous reconnecter.");
                  localStorage.removeItem("token");
                  clearUser();
                  navigate("/");
                  return;
                }
                toast.error(data.message || "❌ Erreur lors de l'archivage");
                return;
              }

              toast.success("✅ Locataire et tous ses paiements/documents archivés avec succès !");
              // Ici tu peux éventuellement mettre à jour le state local pour retirer ce locataire
              navigate("/Mes__archives");
            } catch (err) {
              console.error("Erreur archivage locataire:", err);
              toast.error("❌ Erreur serveur lors de l'archivage");
            } finally {
              toast.dismiss(t.id);
            }
          }}
        >
          Oui, archiver
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

  // 🔹 Suppression paiement
const deleteRent = async (rentId) => {
  if (!user?.token) {
    toast.error("Vous devez être connecté pour supprimer un paiement.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:4000/rents/${rentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Erreur lors de la suppression du paiement");
    }

    toast.success("💰 Paiement supprimé avec succès !");
    setDeleteRentModal({ open: false, rentId: null });

    // 🔄 Rechargement des données du locataire
    fetchPersonData();
  } catch (err) {
    console.error("❌ Erreur suppression paiement :", err);
    toast.error(err.message || "Échec de la suppression du paiement.");
  }
};

  const currentRentals = Array.isArray(person.rentals)
    ? person.rentals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

const handleDownload = (filePath) => {
  const filename = filePath.split("/").pop();
  window.open(`http://localhost:4000/documents/${filename}/download`, "_blank");
};

const handleAdd = async () => {
  try {
    if (!month) {
      toast.error("⚠️ Veuillez sélectionner un mois !");
      return;
    }

    // Vérifier doublon côté frontend
    const duplicate = person.rentals?.some(r => r.month === month);
    if (duplicate) {
      toast.error(
        `⚠️ Paiement pour le mois ${new Date(month + "-01").toLocaleString("default", {
          month: "long",
          year: "numeric"
        })} déjà enregistré !`
      );
      return;
    }

    // Montant loyer
    const montantLoyer = Number(person.homeId?.rent || 0);

    // Préparer les données à envoyer
    const dataForm = {
      personId: id,
      homeId: person.homeId?._id || "",
      adminId: user?.adminId || user?._id,
      month,
      mode,
      status,
      amount: montantLoyer,
      time: time || new Date().toLocaleTimeString(),
      date_of_payment: date_of_payment || new Date().toISOString(),
    };

    // 🔹 Appel API sécurisé avec token
    const res = await fetch("http://localhost:4000/NewRents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`,
      },
      body: JSON.stringify(dataForm),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      toast.success("✅ Paiement ajouté avec succès !");

      // 🔹 Mettre à jour localement avec la donnée du backend (inclut createdBy déjà formaté)
      setPerson(prev => ({
        ...prev,
        rentals: [...(prev.rentals || []), result.dataPayment],
      }));

      // Réinitialiser formulaire
      setShowPaymentModal(false);
      setDate("");
      setMonth("");
      setStatus("");
      setTime("");
      setMode("");
    } else {
      toast.error("❌ " + (result.message || "Erreur lors de l'ajout du paiement"));
    }
  } catch (err) {
    console.error("Erreur lors de l'ajout :", err);
    toast.error("❌ Erreur serveur, réessayez plus tard");
  }
};

  // 🔹 Ajouter un nouveau travail
  const handleAddWork = async () => {
    if (!workTitle || !workDescription || !workDate) {
      toast.error("⚠️ Veuillez remplir tous les champs obligatoires !");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/works`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           homeId: person.homeId?._id || "",
          personId: id,
          adminId: user._id,
          title: workTitle,
          description: workDescription,
          cost: workCost || 0,
          date: workDate,
          createdBy: user._id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✅ Travail ajouté !");
        setWorks((prev) => [...prev, data.work]); // mettre à jour liste
        setShowWorkModal(false);
        // reset form
        setWorkTitle("");
        setWorkDescription("");
        setWorkCost("");
        setWorkDate("");
      } else {
        toast.error(data.message || "Erreur lors de l'ajout");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur, réessayez plus tard");
    }
  };

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
              const res = await fetch(`http://localhost:4000/works/${workId}`, {
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


  // 🔹 Récupération documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:4000/locataire/${id}/documents`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Impossible de récupérer les documents");
      setDocuments(data.documents || {});
    } catch (err) {
      toast.error("Erreur serveur : " + err.message);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);

const refreshContract = async (personId) => {
  try {
    const res = await fetch(`http://localhost:4000/contracts/${personId}`); // id = locataire

    if (!res.ok) {
      if (res.status === 404) {
        toast.info("Aucun contrat trouvé pour ce locataire.");
      } else {
        toast.error("Erreur lors du chargement du contrat.");
      }
      setContract(null);
      return;
    }

    const data = await res.json();

    if (data && typeof data === "object" && !Array.isArray(data)) {
      setContract(data);
      toast.success("Contrat mis à jour ✅");
    } else {
      setContract(null);
      toast.info("Aucun contrat disponible.");
    }

  } catch (err) {
    console.error("Erreur lors du rafraîchissement du contrat :", err);
    toast.error("Impossible de rafraîchir le contrat.");
  }
};
    // 📎 Téléchargement du contrat
  const handleDownloadContract = async (filePath) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${filePath}`);
      if (!response.ok) throw new Error("Fichier introuvable");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement du contrat.");
    }
  };

  
const rentals = Array.isArray(person.rentals) ? person.rentals : [];

const groupedByYear = rentals.reduce((groups, rent) => {
  const year = rent.month ? new Date(rent.month).getFullYear() : "Inconnue";
  if (!groups[year]) groups[year] = [];
  groups[year].push(rent);
  return groups;
}, {});

// 🔹 Gérer ouverture/fermeture des années
const [openYears, setOpenYears] = useState({});
const toggleYear = (year) => {
  setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
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
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/Accueil">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/users">Locataires</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Détails du profil</li>
                  </ol>
                </nav>

                {/* Profil */}
                <div className="tenant-card">
                  <div className="tenant-header">
                    <h2 className="tenant-title">{person.name} {person.lastname}</h2>
                    <div>
                      <button className="btn__updateProfil" onClick={() => setIsModalOpen(true)}>
                          <i className="fa-solid fa-pen-to-square"></i> Mettre à jour
                        </button>
                      <button className="btn__archive" onClick={() => handleArchive(person._id)}>
                        <i className="fa-solid fa-box-archive"></i> Archiver
                      </button>
                    </div>
                  </div>

                  {/* Infos personnelles */}
                  <div className="tenant-section">
                    <h3 className="section-title">Informations personnelles</h3>
                    <div className="info-grid">
                      <p><span>Nom :</span> {person.name || "N/A"}</p>
                      <p><span>Prénom :</span> {person.lastname || "N/A"}</p>
                      <p><span>Date de naissance :</span> {formatDate(person.birth)}</p>
                      <p><span>Lieu de naissance :</span> {formatDate(person.lieu)}</p>
                      <p><span>Sexe :</span> {person.sexe || "N/A"}</p>
                      <p><span>Nationalité :</span> {person.nationality || "N/A"}</p>
                      <p><span>Téléphone :</span> {person.tel || "N/A"}</p>
                      <p><span>Contact d'Urgence :</span> {person.tel_urgency || "N/A"}</p>
                      <p><span>Email :</span> {person.email || "N/A"}</p>
                      <p><span>Profession :</span> {person.profession || "N/A"}</p>
                         <p><span>Ville :</span> {person.city || "N/A"}</p>
                      <p><span>Domicile :</span> {person.address || "N/A"}</p>
                      <p><span>Situation matrimoniale :</span> {person.situation || "N/A"}</p>
                    </div>
                  </div>

                  {/* Pièces d’identité */}
                  <div className="tenant-section">
                    <h3 className="section-title">Pièce d'identité</h3>
                    <div className="info-grid">
                      <p><span>N° CNI/PAS :</span> {person.pieces || "N/A"}</p>
                      <p><span>Date d’émission :</span> {formatDate(person.date_emission)}</p>
                      <p><span>Date d’expiration :</span> {formatDate(person.date_expiration)}</p>
                      <p><span>Date d'entrée :</span> {formatDate(person.date_entrance)}</p>
                      <p><span>Date de sortie :</span> {person.release_date || "N/A"}</p>
                    </div>
                  </div>

                  {/* Documents */}
          <div className="tenant-section">
      <h3 className="section-title">Documents</h3>

      <div className="info-grid">
<ul className="doc-list">
  {Object.keys(documents).length === 0 && <li>Aucun document</li>}
  {Object.entries(documents).map(([key, doc]) =>
    doc ? (
      <li key={doc._id} className="doc-item">
        <div className="doc-info">
          <i className="fa-regular fa-file-pdf pdf-icon"></i>
          <div>
            <strong>{doc.type}</strong>
            <p className="doc-name">
              {(() => {
                const filename = doc.filePath.split("/").pop();
                return filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
              })()}
            </p>
          </div>
        </div>

        <div className="doc-actions">
          {/* <button className="btn-view" onClick={() => window.open(doc.filePath, "_blank")}>
            🔍 Voir
          </button> */}
          <button className="btn-secondary" onClick={() => handleDownload(doc.filePath)}>
            ⬇️ Télécharger
          </button>
      
        </div>
      </li>
    ) : null
  )}
</ul>

        <button
            className="btn-document"
            onClick={() => setShowDocumentModal(true)}
          >
            <i className="fa-solid fa-file-upload"></i> Ajouter / Remplacer un document / Supprimer
          </button>
      </div>
    </div>


{/* 
                <div className="tenant-section">
                  <h3 className="section-title">Contrat de bail</h3>
                  <div className="info-grid">
                    {contract ? (
                      <ul className="doc-list">
                        <li
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            padding: "10px 15px",
                            marginBottom: "8px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                      
                          <div style={{ flex: 1 }}>
                            <p>📄 <strong>Fichier :</strong> {contract.filePath ? contract.filePath.split("/").pop() : "Aucun"}</p>
                            <p>📅 <strong>Début :</strong> {contract.startDate ? new Date(contract.startDate).toLocaleDateString("fr-FR") : "Non défini"}</p>
                            <p>📅 <strong>Fin :</strong> {contract.endDate ? new Date(contract.endDate).toLocaleDateString("fr-FR") : "Non défini"}</p>
                            <p>⏱️ <strong>Durée :</strong> {contract.durationMonths ? `${contract.durationMonths} mois` : "Non spécifiée"}</p>
                            <p>🔁 <strong>Fréquence :</strong> {contract.paymentFrequency || "mensuel"}</p>
                            <p>📌 <strong>Statut :</strong> 
                              <span 
                                style={{ 
                                  color: contract.status === "expiré" ? "#dc2626" 
                                        : contract.status === "résilié" ? "#f59e0b" 
                                        : "#16a34a" 
                                }}
                              >
                                {contract.status || "Inconnu"}
                              </span>
                            </p>
                          </div>

                       
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {contract.filePath && (
                              <button className="btn-secondary" onClick={() => handleDownloadContract(contract.filePath)}>
                                Télécharger
                              </button>
                            )}
                            <button className="btn-document" onClick={() => setShowContractModal(true)}>
                              <i className="fa-solid fa-file-signature"></i> Remplacer le contrat
                            </button>
                          </div>
                        </li>
                      </ul>
                    ) : (
                      <div style={{ padding: "10px", color: "#555", fontStyle: "italic" }}>
                        Aucun contrat enregistré
                        <div style={{ marginTop: "10px" }}>
                          <button className="btn-document" onClick={() => setShowContractModal(true)}>
                            <i className="fa-solid fa-file-upload"></i> Ajouter un contrat de bail
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div> */}
             
                <div className="tenant-section">

                  {/* Accès */}
                  <div className="tenant-section">
                    <h3 className="section-title">Accès</h3>
                    <div className="info-grid">
                      <p><span>Username :</span> {person.username || "N/A"}</p>
                      <p><span>Password :</span> {person.password || "N/A"}</p>
                    </div>
                  </div>

                {/* Créé par + Mis à jour par */}
                <div className="tenant-section">
                  <h3 className="section-title">Traçabilité</h3>
                  <div className="info-grid">
                    <p>
                      <span>Créé par :</span>{" "}
                      <strong style={{ color: "#2563eb" }}>
                        {person.createdBy || "Non spécifié"}
                      </strong>
                    </p>
                    <p>
                      <span>Date de création :</span>{" "}
                      {person.createdAt
                        ? new Date(person.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            // second: "2-digit",
                          })
                        : "Non disponible"}
                    </p>
                    <p>
                      <span>Dernière modification par :</span>{" "}
                      <strong style={{ color: "#16a34a" }}>
                        {person.updatedBy || "Aucune modification"}
                      </strong>
                    </p>
                    <p>
                      <span>Date de dernière mise à jour :</span>{" "}
                      {person.updatedAt
                        ? new Date(person.updatedAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            // second: "2-digit",
                          })
                        : "Non disponible"}
                    </p>
                  </div>
                </div>

                  {/* Logement */}
                  <div className="tenant-section">
                    <h3 className="section-title">Logement attribué</h3>
                    {person.homeId ? (
                      <div className="home-card">
                        <div className="home-images" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {person.homeId.img && (
                            <img
                              src={person.homeId.img.startsWith("http") ? person.homeId.img : `http://localhost:4000/${person.homeId.img}`}
                              alt="Home principale"
                              className="home-image"
                              style={{ width: "150px", height: "150px", objectFit: "cover" }}
                            />
                          )}
                          {Array.isArray(person.homeId.images) && person.homeId.images.length > 0 && person.homeId.images.map((url, idx) => (
                            <img
                              key={idx}
                              src={url.startsWith("http") ? url : `http://localhost:4000/${url}`}
                              alt={`Home secondaire ${idx}`}
                              className="home-image"
                              style={{ width: "150px", height: "150px", objectFit: "cover" }}
                            />
                          ))}
                          {!person.homeId.img && (!person.homeId.images || person.homeId.images.length === 0) && (
                            <p>Aucune image disponible</p>
                          )}
                        </div>
                        <div className="home-info">
                          <p><span>Nom :</span> {person.homeId.nameHome || "N/A"}</p>
                          <p><span>Référence :</span> {person.homeId.reference || "N/A"}</p>
                          <p><span>Type :</span> {person.homeId.categorie || "N/A"}</p>
                          <p><span>Adresse :</span> {person.homeId.addressHome || "N/A"}</p>
                          <p><span>Ville :</span> {person.homeId.city || "N/A"}</p>
                          <p><span>Nombre de pièces :</span> {person.homeId.NmbrePieces || "N/A"}</p>
                          <p><span>Loyer mensuel :</span> {person.homeId.rent ? Number(person.homeId.rent).toLocaleString() : "N/A"} FCFA</p>
                          <p><span>Caution :</span> {person.homeId.guarantee ? Number(person.homeId.guarantee).toLocaleString() : "N/A"} FCFA</p>
                          <p><span>Statut :</span> {person.homeId.state || "Occupé"}</p>
                          <p><span>Description :</span> {person.homeId.description || "Aucune description"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="no-home">Aucun logement attribué</p>
                    )}
                  </div>

              {/* travaux */}
              <div className="tenant-section">
                <h3 className="section-title">Travaux maison</h3>
                <div className="works-list">
                  {works.length === 0 ? (
                    <p>Aucun travail enregistré</p>
                  ) : (
                    works.map((work) => (
                      <div key={work._id} className="work-card">
                        <div className="work-header">
                          <p><strong>Titre :</strong> {work.title}</p>
                          <i
                            className="fa-solid fa-trash delete-icon"
                            onClick={() => confirmDeleteWork(work._id)}
                          ></i>
                        </div>
                        <p><strong>Description :</strong> {work.description}</p>
                        <p><strong>Coût :</strong> {work.cost ? `${work.cost} FCFA` : "N/A"}</p>
                        <p><strong>Date :</strong> {work.date ? new Date(work.date).toLocaleDateString("fr-FR") : "N/A"}</p>
                      </div>
                    ))
                  )}
                </div>
                <button className="btn-add" onClick={() => setShowWorkModal(true)}>
                  <i className="fa-solid fa-plus"></i> Ajouter un travail effectué
                </button>
              </div>
<div className="tenant-section paiement-section">
  <h3 className="section-title">Détails des paiements</h3>

  <div className="paiement-actions">
    {/* <Link to={`/paiementDetail/${person._id}`}>
      <button className="btn-all">Voir tous les paiements &gt;&gt;</button>
    </Link> */}

    <button className="btn-add" onClick={() => setShowPaymentModal(true)}>
      <i className="fa-solid fa-money-check"></i> Ajouter un paiement
    </button>
  </div>

  <div ref={componentRef} className="table-responsive">
    <table className="table table-paiement">
      <thead>
        <tr>
          {/* <th>Année</th> */}
          <th>Dernière modification</th>
          <th>Heures</th>
          <th>Date paiement</th>
          <th>Mois</th>
          <th>Montant</th>
          <th>Statut</th>
          <th>Mode</th>
          <th>Action</th>
          <th>Imprimer</th>
        </tr>
      </thead>

      <tbody>
        {Object.keys(groupedByYear)
          .sort((a, b) => b - a)
          .map((year) => (
            <React.Fragment key={year}>
              {/* Ligne d’en-tête de l’année */}
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
                <td colSpan="10" style={{ textAlign: "center" }}>
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

              {/* Lignes des paiements de cette année */}
              {openYears[year] &&
                [...groupedByYear[year]]
                  .sort((a, b) => new Date(b.month) - new Date(a.month))
                  .map((rental) => (
                    <tr key={rental._id} className="rent-row">
                      {/* <td>{year}</td> */}

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

                      <td>
                        {rental.time
                          ? new Date(`1970-01-01T${rental.time}`).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "N/A"}
                      </td>

                      <td>
                        {rental.date_of_payment
                          ? new Date(rental.date_of_payment).toLocaleDateString("fr-FR")
                          : "N/A"}
                      </td>

                      <td>
                        {rental.month
                          ? new Date(rental.month).toLocaleString("default", {
                              month: "long",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      <td>
                        {rental.amount
                          ? `${rental.amount.toLocaleString()} FCFA`
                          : "N/A"}
                      </td>

                      <td>{rental.status || "N/A"}</td>
                      <td>{rental.mode || "N/A"}</td>

                      <td>
                        <i
                          className="fa-solid fa-trash trash-icon"
                          onClick={() =>
                            setDeleteRentModal({ open: true, rentId: rental._id })
                          }
                        ></i>
                        <Link
                          to="#"
                          onClick={() => {
                            setSelectedRent(rental);
                            setShowEditModal(true);
                          }}
                        >
                          <i
                            className="fa-solid fa-pen-to-square"
                            style={{
                              marginLeft: 10,
                              color: "#2563eb",
                              cursor: "pointer",
                            }}
                          ></i>
                        </Link>
                      </td>

                      <td>
                        <Link to={`/receipt/${rental._id}`}>
                          <i className="fa-solid fa-print"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
            </React.Fragment>
          ))}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
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
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Suivant
      </button>
    </div>
  )}
</div>
                </div>

                </div>
              </div>
            )}
          </div>
        </div>

        <Toaster position="top-right" reverseOrder={false} />
      </div>
      <Footer />

      {/* Modal suppression paiement */}
      {deleteRentModal.open && (
        <div className="modal-overlayes">
          <div className="modals">
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous supprimer ce paiement ?</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={() => deleteRent(deleteRentModal.rentId)}>Oui, supprimer</button>
              <button className="btn-cancel" onClick={() => setDeleteRentModal({ open: false, rentId: null })}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout paiement */}
      {showPaymentModal && (
        <div className="modal-overlay-paiement">
          <div className="modal--paiement">
            <div className="modal-payment">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>💳 Ajouter un paiement</h3>
                  <button className="close-btn" onClick={() => setShowPaymentModal(false)}>&times;</button>
                </div>

                <div className="tenant-summary">
                  <h4>📌 Informations Locataire</h4>
                  <p><strong>Nom :</strong> {person.name} {person.prenom}</p>

                  {person.homeId ? (
                    <div className="tenant-home">
                      <p><strong>Bien :</strong> {person.homeId.categorie}</p>
                      <p><strong>Adresse :</strong> {person.homeId.addressHome}</p>
                      <p><strong>Loyer :</strong> {person.homeId.rent} FCFA</p>
                    </div>
                  ) : (
                    <p>Aucun logement attribué</p>
                  )}
                </div>

                <div className="payment-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date de paiement</label>
                      <input type="date" required value={date_of_payment} onChange={(e) => setDate(e.target.value)} />
                    </div>
                   <div className="form-group">
                    <label>Heure de paiement</label>
                    <input type="text" value={new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} readOnly />
                  </div>
                    <div className="form-group">
                      <label>Mois concerné</label>
                      <input type="month" required value={month} onChange={(e) => setMonth(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Mode de paiement</label>
                      <select required value={mode} onChange={(e) => setMode(e.target.value)}>
                        <option value="">Sélectionner</option>
                        <option value="Versement">Versement</option>
                        <option value="Virement">Virement</option>
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money">Mobile Money</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Statut</label>
                      <select required value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Sélectionner</option>
                        <option value="Payé">✅ Payé</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>Annuler</button>
                    <button className="btn-submit" onClick={handleAdd}>Enregistrer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    {showWorkModal && (
        <div className="modal-overlayes">
          <div className="modals">
            <h3>Ajouter un travail</h3>
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Coût (FCFA)</label>
              <input
                type="number"
                value={workCost}
                onChange={(e) => setWorkCost(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={handleAddWork}>
                Ajouter
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowWorkModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

{showDocumentModal && (
  <UploadDocument
    personId={person._id}
    onClose={() => {
      setShowDocumentModal(false);
      fetchPersonData(); // recharge les documents
    }}
  />
)}

{showContractModal && (
  <ContractModal
    personId={person._id}
    adminId={user._id}
    homeId={person.homeId?._id}
    onClose={() => setShowContractModal(false)}
    onContractSaved={() => refreshContract(person._id)}// ← callback pour rafraîchir le contrat après sauvegarde
  />
)}


{showEditModal && selectedRent && (
  <div className="modal-overlay-rent">
    <div className="modal-box-rent">
      <h3><i className="fa-solid fa-pen"></i> Modifier les informations du paiement</h3>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          try {
            const now = new Date();
            const currentTime = now.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const payload = {
              date_of_payment: selectedRent.date_of_payment,
              month: selectedRent.month,
              mode: selectedRent.mode,
              time: currentTime,
              amount: selectedRent.amount, // montant conservé mais non modifiable
            };

            const res = await fetch(`http://localhost:4000/updateRent/${selectedRent._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user?.token}`,
              },
              body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success("✅ Paiement mis à jour avec succès !");
            setShowEditModal(false);
            fetchRents();

          } catch (err) {
            console.error("Erreur mise à jour :", err);
            toast.error("❌ " + err.message);
          }
        }}
      >
        {/* 🗓️ Date de paiement */}
        <div className="form-group">
          <label>Date de paiement</label>
          <input
            type="date"
            value={
              selectedRent.date_of_payment
                ? new Date(selectedRent.date_of_payment).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedRent({ ...selectedRent, date_of_payment: e.target.value })
            }
            required
          />
        </div>

        {/* 🕒 Heure auto */}
        <div className="form-group">
          <label>Heure de paiement (auto)</label>
          <input
            type="text"
            value={new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            readOnly
          />
        </div>

        {/* 📆 Mois */}
        <div className="form-group">
          <label>Mois concerné</label>
          <input
            type="month"
            value={selectedRent.month || ""}
            onChange={(e) =>
              setSelectedRent({ ...selectedRent, month: e.target.value })
            }
            required
          />
        </div>

        {/* 💰 Montant (lecture seule) */}
        <div className="form-group">
          <label>Montant du paiement (FCFA)</label>
          <input
            type="number"
            value={selectedRent.amount || ""}
            readOnly
            style={{
              backgroundColor: "#f5f5f5",
              color: "#666",
              cursor: "not-allowed"
            }}
          />
        </div>

        {/* 💳 Mode de paiement */}
        <div className="form-group">
          <label>Mode de paiement</label>
          <select
            value={selectedRent.mode || ""}
            onChange={(e) =>
              setSelectedRent({ ...selectedRent, mode: e.target.value })
            }
            required
          >
            <option value="">Sélectionner</option>
            <option value="Versement">Versement</option>
            <option value="Virement">Virement</option>
            <option value="Cash">Cash</option>
            <option value="Mobile Money">Mobile Money</option>
          </select>
        </div>

        {/* 🔘 Actions */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => setShowEditModal(false)}
          >
            Annuler
          </button>
          <button type="submit" className="btn-save">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
)}


<UpdateProfilModal
  person={person}          // passer l'objet complet
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onUpdate={() => console.log("Rafraîchir la liste après update")}
/>

      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .loading { display: flex; justify-content: center; align-items: center; height: 60vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .breadcrumb ol { display: flex; list-style: none; padding: 0; gap: .5rem; font-size: 14px; }
        .breadcrumb a { text-decoration: none; color: #2563eb; }
        .header-actions { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
        .btn-print { background: #2563eb; color: #fff; border: none; padding: .6rem 1.2rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
        .btn-print:hover { background: #1e40af; }
        .info-blocks { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .info-block { flex: 1; min-width: 250px; background: #f9fafb; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; }
        .info-block h3 { margin-bottom: 1rem; }
        .info-block p { margin: .3rem 0; font-size: 14px; }
        .paiement-section .paiement-actions { display: flex; gap: 10px; margin-bottom: 10px; }
        .btn-add, .btn-all { padding: 6px 12px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .table-paiement { width: 100%; border-collapse: collapse; }
        .table-paiement th, .table-paiement td { padding: 8px 10px; border: 1px solid #ddd; text-align: center; }
        .trash-icon { color: red; cursor: pointer; }
        .pagination { display: flex; justify-content: center; gap: 5px; margin-top: 15px; }
        .status { padding: .2rem .6rem; border-radius: 12px; font-size: 12px; }
        .status.paid { background: #dcfce7; color: #166534; }
        .status.pending { background: #fef9c3; color: #854d0e; }
        .documents-section ul { list-style: none; padding: 0; }
        .documents-section li { margin-bottom: .5rem; font-size: 14px; }
        .work-card { border: 1px solid #ddd; padding: 10px; margin-bottom: 8px; border-radius: 6px; background: #f9fafb; }
        .works-list { margin-bottom: 10px; }
        .work-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.work-header {
  display: flex;
  justify-content: space-between; /* ✅ texte à gauche, icône à droite */
  align-items: center;
}

.delete-icon {
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.delete-icon:hover {
  color: #dc2626;
  transform: scale(1.2);
}
     .modal-overlay-rent {
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex; justify-content: center; align-items: center;
        z-index: 1000;
      }
      .modal-box-rent {
        background: #fff; padding: 25px;
        border-radius: 10px; width: 420px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: fadeIn .3s ease;
      }
      .modal-box h3 { margin-bottom: 20px; text-align: center; color: #111; }
      .form-group { margin-bottom: 12px; }
      .form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
      .form-group input {
        width: 100%; padding: 10px;
        border: 1px solid #ccc; border-radius: 6px;
      }
      .modal-actions {
        display: flex; justify-content: flex-end; gap: 10px;
      }
      .btn-cancel {
        background: #e5e7eb; border: none;
        padding: 8px 14px; border-radius: 6px; cursor: pointer;
      }
      .btn-save {
        background: #2563eb; color: #fff;
        border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
        .rent-cell {
  font-size: 0.8rem;
  color: #444;
  text-align: center;
  vertical-align: middle;
  padding: 10px 8px;
  border-bottom: 1px solid #ddd;
  min-width: 120px; /* Largeur uniforme minimale */
  max-width: 200px;
  word-wrap: break-word;
}

.rent-cell i {
  font-size: 0.85rem;
}

tr:hover .rent-cell {
  background-color: #f9fafb; /* Survol doux */
}

.year-row {
  background: #e8eefc;
  color: #1e40af;
  font-weight: 700;
  font-size: 0.95rem;
}

.accordion-content {
  overflow: hidden;
  transition: max-height 0.4s ease, opacity 0.3s ease;
  max-height: 0;
  opacity: 0;
}
.accordion-content.open {
  max-height: 1000px;
  opacity: 1;
}
.year-row:hover {
  background: #e0e7ff;
}
.arrow.open {
  transform: rotate(90deg);
}
.rent-row {
  transition: all 0.3s ease;
}
.rent-row:hover {
  background-color: #f9fafb;
}

.doc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
}

.doc-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pdf-icon {
  font-size: 1.5rem;
  color: #dc2626;
}

.doc-name {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.doc-actions {
  display: flex;
  gap: 8px;
}

.btn-view {
  background: #22c55e;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
}
      `}</style>
    </div>
  );
}