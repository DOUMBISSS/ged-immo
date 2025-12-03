import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { toast, Toaster } from "react-hot-toast";
import { UpdateHomeModal } from "./Maison/UpdateHomeModal";
import { useUserContext } from "../contexts/UserContext"
import DuplicateHomeModal from "./Maison/DuplicateHomeModal";

export default function DetailHome() {
    // ✅ Image par défaut (logo)
  const DEFAULT_IMAGE = "/logo4 copie.jpg";

  const { id } = useParams();
  const navigate = useNavigate();
  const [rentHome, setRentHome] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
   const [showUpdateModal, setShowUpdateModal] = useState(false);
   const [showDuplicateModal, setShowDuplicateModal] = useState(false);
     const { user ,hasFeature } = useUserContext(); // ✅ récupération de l’admin connecté

  useEffect(() => {
    fetch(`https://backend-ged-immo.onrender.com/api/homes/${id}`)
      .then((res) => res.json())
      .then((data) => setRentHome(data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!rentHome) return <p>Chargement...</p>;

const handleArchive = () => {
  // 🚫 Vérifier si la maison est occupée ou non disponible
  if (rentHome.personId || rentHome.state !== "Disponible") {
    toast.error(
      "❌ Impossible d’archiver cette maison. Libérez d’abord le locataire et assurez-vous qu'elle est disponible.",
      { duration: 8000 }
    );
    return;
  }

  // 🚫 Vérifier si l'utilisateur a la permission
  if (!user?.permissions?.includes("archive_homes") && user.role !== "admin") {
    toast.error(
      "⛔ Vous n’avez pas la permission d’archiver des maisons. Contactez votre administrateur.",
      { duration: 8000 }
    );
    return;
  }

  // ⚠️ Confirmation d’archivage
  toast((t) => (
    <div style={{ padding: "1rem", maxWidth: "320px" }}>
      <p>
        ⚠️ Attention ! Cette action va archiver la maison. 
        Êtes-vous sûr de continuer ?
      </p>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          style={{
            backgroundColor: "#ef4444",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={async () => {
            try {
              const res = await fetch(`https://backend-ged-immo.onrender.com/homes/${id}/archive`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${user.token}`,
                },
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Erreur lors de l'archivage");

              toast.success(data.message || "🏠 Maison archivée avec succès !");
              navigate("/Mes__archives");
            } catch (err) {
              console.error(err);
              toast.error("Erreur serveur, réessayez plus tard.");
            } finally {
              toast.dismiss(t.id);
            }
          }}
        >
          Oui
        </button>

        <button
          style={{
            backgroundColor: "#6b7280",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => toast.dismiss(t.id)}
        >
          Non
        </button>
      </div>
    </div>
  ), { duration: 50000 });
};


const handleDuppliquer = async () => {
  if (!hasFeature("duplicateHomes")) {
    toast.error("🔒 Fonction disponible uniquement dans le plan Standard ou Premium.");
    return;
  }

  try {
    const res = await fetch(`https://backend-ged-immo.onrender.com/homes/${id}/duplicate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`,
      },
      body: JSON.stringify({ projectId: rentHome.projectId }),
    });
    

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur duplication");
    toast.success("✅ Maison dupliquée avec succès !");
  } catch (err) {
    console.error("Erreur duplication :", err);
    toast.error(err.message || "Erreur serveur.");
  }
};



  return (
    <div style={styles.page}>
      <Navbar />
      <Toaster position="top-right" />

      <div style={styles.container}>
        {/* Breadcrumb */}
       <nav aria-label="breadcrumb" style={styles.breadcrumb}>
    <ol>
    <li>
      <Link to="/Mes__projet/fr/">Mes projets</Link>
    </li>
    <li>
      <span
        style={{ color: "#2563eb", cursor: "pointer" }}
        onClick={() => navigate(`/detail_projet/fr/${rentHome.projectId}`)}
      >
        Détails du projet
      </span>
    </li>
    <li>Détails du logement</li>
  </ol>
</nav>

        {/* Header */}
        <div style={styles.header}>
          <h1>{rentHome.nameHome} - {rentHome.categorie} - {rentHome.NmbrePieces || "N/A"} pièces</h1>
          <div style={styles.actions}>
            <button style={styles.btnBack} onClick={() => navigate(`/detail_projet/fr/${rentHome.projectId}`)}>
              <i className="fa-solid fa-arrow-left"></i> Retour
            </button>
            <div style={styles.btnGroup}>
             <button style={styles.btnUpdate} onClick={() => setShowUpdateModal(true)}>Mettre à jour</button>
              <button style={styles.btnArchive} onClick={handleArchive}>Archiver</button>
                  <button
          onClick={() => setShowDuplicateModal(true)}
          disabled={!hasFeature("duplicateHomes")}
          style={{
            opacity: hasFeature("duplicateHomes") ? 1 : 0.6,
            cursor: hasFeature("duplicateHomes") ? "pointer" : "not-allowed",
            background: hasFeature("duplicateHomes") ? "#2563eb" : "#9ca3af",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: ".5rem",
            fontWeight: 500,
          }}
        >
          <i className="fa-solid fa-copy"></i> Dupliquer
        </button>
            </div>
          </div>
        </div>

        {/* Main content */}
<div style={styles.imagesSection}>
  {/* 🖼️ Grande image principale */}
  <div style={styles.mainImage}>
    {selectedImage ? (
      <img
        src={
          selectedImage.startsWith("http")
            ? selectedImage
            : `https://backend-ged-immo.onrender.com/${selectedImage}`
        }
        alt="Image sélectionnée"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />
    ) : rentHome?.img ? (
      <img
        src={
          rentHome.img.startsWith("http")
            ? rentHome.img
            : `https://backend-ged-immo.onrender.com/${rentHome.img}`
        }
        alt="Image principale"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />
    ) : (
      // 🔹 Image par défaut si aucune image n'est disponible
      <img
        src="/logo4 copie.jpg"
        alt="Aucune image disponible"
        style={{
          width: "70%",
          height: "70%",
          objectFit: "contain",
          background: "#f9fafb",
          borderRadius: "10px",
          // border: "1px solid #e5e7eb",
          padding: "20px",
        }}
      />
    )}
  </div>

  {/* 🔹 Miniatures cliquables (inclut l’image principale si dispo) */}
  <div style={styles.thumbnailGallery}>
    {rentHome?.img || (rentHome?.images && rentHome.images.length > 0) ? (
      [rentHome.img, ...(rentHome.images || [])].map((img, index) => {
        if (!img) return null;
        const imagePath = img.path || img;
        const imageURL = imagePath.startsWith("http")
          ? imagePath
          : `https://backend-ged-immo.onrender.com/${imagePath}`;
        const isSelected = selectedImage
          ? selectedImage === imagePath
          : index === 0; // par défaut : première image sélectionnée
        return (
          <div
            key={index}
            style={{
              ...styles.thumbnailBox,
              border: isSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
              transform: isSelected ? "scale(1.05)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
            onClick={() => setSelectedImage(imagePath)}
          >
            <img
              src={imageURL}
              alt={`Image ${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            />
          </div>
        );
      })
    ) : (
      // 🔸 Si aucune miniature, on affiche aussi la miniature par défaut
      <div
        style={{
          ...styles.thumbnailBox,
          border: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f9fafb",
        }}
      >
        <img
          src="/logo4 copie.jpg"
          alt="Pas d'image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </div>
    )}
  </div>
</div>

{/* ===== Détails de la maison ===== */}
<div style={styles.detailsSection}>
  <h2>Détails du bien</h2>
  <div style={styles.detailsGrid}>
    <p><strong>Nom :</strong> {rentHome.nameHome || "N/A"}</p>
    <p><strong>Type :</strong> {rentHome.nameHomeType || "N/A"}</p>
    <p><strong>Catégorie :</strong> {rentHome.categorie || "N/A"}</p>
    <p><strong>Référence ou N°Porte :</strong> {rentHome.reference || "N/A"}</p>
    <p><strong>Loyer :</strong> {rentHome.rent || "N/A"} FCFA</p>
    {/* <p><strong>Prix :</strong> {rentHome.price ? `${rentHome.price} FCFA` : "N/A"}</p> */}
    <p><strong>Adresse :</strong> {rentHome.addressHome || "N/A"}</p>
    <p><strong>Ville :</strong> {rentHome.city || "N/A"}</p>
    <p><strong>Quartier :</strong> {rentHome.quarter || "N/A"}</p>
    <p><strong>Zone :</strong> {rentHome.zone || "N/A"}</p>
    <p><strong>Nombre de pièces :</strong> {rentHome.NmbrePieces || "N/A"}</p>
    <p><strong>Description :</strong> {rentHome.description || "Aucune description"}</p>
    <p><strong>Caution :</strong> {rentHome.guarantee || "N/A"} FCFA</p>
    <p><strong>Charges :</strong> {rentHome.charges || "N/A"}</p>
    <p><strong>État :</strong> {rentHome.state || "N/A"}</p>

    {/* Spécifiques selon le type */}
    {rentHome.nameHomeType === "Bureau" && (
      <>
        <p><strong>Surface bureau :</strong> {rentHome.surfaceBureau || "N/A"}m²</p>
        <p><strong>Nombre de bureaux :</strong> {rentHome.NmbreBureaux || "N/A"}</p>
        <p><strong>Salle de réunion :</strong> {rentHome.salleReunion ? "Oui" : "Non"}</p>
        <p><strong>Climatisation :</strong> {rentHome.climatisation ? "Oui" : "Non"}</p>
        <p><strong>Fibre optique :</strong> {rentHome.fibreOptique ? "Oui" : "Non"}</p>
        <p><strong>Parking :</strong> {rentHome.parking ? "Oui" : "Non"}</p>
        <p><strong>Ascenseur :</strong> {rentHome.ascenseur ? "Oui" : "Non"}</p>
      </>
    )}

    {rentHome.nameHomeType === "Magasin" && (
      <>
        <p><strong>Surface magasin :</strong> {rentHome.surfaceMagasin || "N/A"}m²</p>
        <p><strong>Vitrine :</strong> {rentHome.vitrine ? "Oui" : "Non"}</p>
        <p><strong>Stock disponible :</strong> {rentHome.stockDisponible ? "Oui" : "Non"}</p>
        <p><strong>Mezanine :</strong> {rentHome.mezanine ? "Oui" : "Non"}</p>
        <p><strong>Zone commerciale :</strong> {rentHome.zoneCommerciale ? "Oui" : "Non"}</p>
      </>
    )}

    {rentHome.nameHomeType === "Entrepôt" && (
      <>
        <p><strong>Surface entrepôt :</strong> {rentHome.surfaceEntrepot || "N/A"} m</p>
        <p><strong>Hauteur sous plafond :</strong> {rentHome.hauteurSousPlafond || "N/A"}</p>
        <p><strong>Capacité de stockage :</strong> {rentHome.capaciteStockage || "N/A"}</p>
        <p><strong>Quai de chargement :</strong> {rentHome.quaiChargement ? "Oui" : "Non"}</p>
        <p><strong>Sécurité :</strong> {rentHome.securite ? "Oui" : "Non"}</p>
        <p><strong>Accès camion :</strong> {rentHome.accesCamion ? "Oui" : "Non"}</p>
        <p><strong>Ventilation :</strong> {rentHome.ventilation ? "Oui" : "Non"}</p>
      </>
    )}
  </div>
</div>

<div style={{ 
  marginTop: "1rem", 
  fontSize: "0.95rem", 
  color: "#2c3e50", 
  background: "#f9fafb", 
  padding: "10px 15px", 
  borderRadius: "8px",
  border: "1px solid #e5e7eb"
}}>
  <p>
    <strong>Créée par :</strong> {rentHome.createdByName || rentHome.createdBy || "Non spécifié"}
  </p>

  <p>
    <strong>Le :</strong>{" "}
    {rentHome.createdAt && new Date(rentHome.createdAt).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
  </p>

  <p>
    <strong>Dernière mise à jour par :</strong> {rentHome.updatedBy || "Non spécifié"}
  </p>

  <p>
    <strong>Le :</strong>{" "}
    {rentHome.updatedAt && new Date(rentHome.updatedAt).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
  </p>
        <p><strong>Restauré par :</strong> {rentHome.restoredBy || "Non restaurée"}</p>
    <p><strong>Date de restauration :</strong> 
      {rentHome.restoredAt ? new Date(rentHome.restoredAt).toLocaleString("fr-FR") : "—"}
    </p>
</div>

        {/* Tenant */}
        <div style={styles.tenantSection}>
          <h2>Locataire assigné</h2>
          {rentHome.personId ? (
            <div style={styles.tenantCard}>
              <div style={styles.tenantBlock}>
                <h3>Informations personnelles</h3>
                <div style={styles.infoGrid}>
                  <p><strong>Nom :</strong> {rentHome.personId.name || "N/A"}</p>
                  <p><strong>Prénom :</strong> {rentHome.personId.lastname || "N/A"}</p>
                  <p><strong>Date de naissance :</strong> {rentHome.personId.birth || "N/A"}</p>
                  <p><strong>Sexe :</strong> {rentHome.personId.sexe || "N/A"}</p>
                  <p><strong>Nationalité :</strong> {rentHome.personId.nationality || "N/A"}</p>
                  <p><strong>Téléphone :</strong> {rentHome.personId.tel || "N/A"}</p>
                  <p><strong>Urgence :</strong> {rentHome.personId.tel_urgency || "N/A"}</p>
                  <p><strong>Email :</strong> {rentHome.personId.email || "N/A"}</p>
                  <p><strong>Profession :</strong> {rentHome.personId.profession || "N/A"}</p>
                  <p><strong>Domicile :</strong> {rentHome.personId.address || "N/A"}</p>
                  
                </div>
              </div>
              <div style={styles.tenantBlock}>
                <h3>Pièce d'identité</h3>
                <div style={styles.infoGrid}>
                  <p><strong>N° CNI/PAS :</strong> {rentHome.personId.pieces || "N/A"}</p>
                  <p><strong>Date émission :</strong> {rentHome.personId.date_emission || "N/A"}</p>
                  <p><strong>Date expiration :</strong> {rentHome.personId.date_expiration || "N/A"}</p>
                  <p><strong>Date entrée :</strong> {rentHome.personId.date_entrance || "N/A"}</p>
                  <p><strong>Date sortie :</strong> {rentHome.personId.realease_date || "N/A"}</p>
                </div>
                {/* Créé par */}
                
              </div>
              
            </div>
          ) : <p>Aucun locataire pour cette maison</p>}
        </div>
      </div>

      {showDuplicateModal && (
  <DuplicateHomeModal
    home={rentHome}
    projectId={rentHome.projectId}
    adminId={user._id}
    onClose={() => setShowDuplicateModal(false)}
    onDuplicated={(newHome) => {
      toast.success("Maison dupliquée !");
      setRentHome(newHome); // mettre à jour la vue si nécessaire
      setShowDuplicateModal(false);
    }}
  />
)}

       {showUpdateModal && (
        <UpdateHomeModal
          home={rentHome}
          onClose={() => setShowUpdateModal(false)}
          onUpdated={(updated) => setRentHome(updated)}
          token={user?.token}
        />
      )}

      <Footer />

      {/* ======= CSS intégré ======= */}
      <style>{`
        body { font-family: 'Inter', sans-serif; background: #f8f9fa; margin: 0; }
        a { text-decoration: none; color: #3498db; }
        h1,h2,h3 { color: #2c3e50; margin-bottom: 0.5rem; }
        .breadcrumb { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .breadcrumb li::after { content: ">"; margin-left: 0.5rem; }
        .breadcrumb li:last-child::after { content: ""; }
        ${Object.entries(styles).map(([k, v]) => `.${k} { ${Object.entries(v).map(([prop, val]) => `${prop}: ${val};`).join(' ')} }`).join(' ')}
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  container: { padding: '2rem', flex: 1 },
  breadcrumb: { fontSize: '0.9rem', color: '#7f8c8d' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  actions: { display: 'flex', alignItems: 'center', gap: '1rem' },
  btnBack: { padding: '0.5rem 1rem', backgroundColor: '#34495e', color: '#fff', borderRadius: '6px', cursor: 'pointer', border: 'none' },
  btnGroup: { display: 'flex', gap: '0.5rem' },
  btnUpdate: { padding: '0.5rem 1rem', backgroundColor: '#3498db', color: '#fff', borderRadius: '6px', cursor: 'pointer', border: 'none' },
  btnArchive: { padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: '#fff', borderRadius: '6px', cursor: 'pointer', border: 'none' },
    btnDupliquer: { padding: '0.5rem 1rem', backgroundColor: '#34495e', color: '#fff', borderRadius: '6px', cursor: 'pointer', border: 'none' },
  mainContent: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  imagesSection: { flex: '1 1 400px', display: 'flex', gap: '1rem' },
  mainImage: { flex: 1, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  thumbnailGallery: { flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  thumbnailBox: { width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  detailsSection: { flex: '1 1 400px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.95rem', color: '#34495e' },
  tenantSection: { marginTop: '2rem' },
  tenantCard: { display: 'flex', gap: '2rem', flexWrap: 'wrap', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  tenantBlock: { flex: '1 1 300px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem', color: '#2c3e50' },
  toastContainer: { padding: '1rem', maxWidth: '300px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  toastBtnContainer: { marginTop: '10px', display: 'flex', justifyContent: 'space-between' },
  toastBtn: { color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', border: 'none' },
  thumbnailBox: {
  width: "80px",
  height: "80px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  cursor: "pointer",
  transition: "all 0.2s ease",
},
thumbnailGallery: {
  flex: 1,
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
},
detailsSection: {
  flex: '1 1 100%',
  backgroundColor: '#fff',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginTop: '2rem',
},
detailsGrid: {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  fontSize: '0.95rem',
  color: '#34495e',
},
};													