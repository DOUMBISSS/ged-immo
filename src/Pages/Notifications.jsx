import React, { useEffect, useState, useRef } from "react";
import { useUserContext } from "../contexts/UserContext";
import { Blocks } from "react-loader-spinner";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Notifications() {
  const { user } = useUserContext();
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWork, setSelectedWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const previousIds = useRef([]);

  // 🔁 Charger les demandes
  const fetchRepairRequests = async (showToast = false) => {
    if (!user?._id || !user?.token) return;
    setLoading(true);
    try {
      const adminId = user.role === "admin" ? user._id : user.adminId;

      const res = await fetch(`https://backend-ged-immo.onrender.com/works/admin/${adminId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Erreur lors du chargement des réparations");
        return;
      }

      const newWorks = data.works || [];
      const newIds = newWorks.map((w) => w._id);

      const added = newIds.filter((id) => !previousIds.current.includes(id));
      if (showToast && added.length > 0) {
        toast.info(
          `${added.length} nouvelle${added.length > 1 ? "s" : ""} demande${added.length > 1 ? "s" : ""} de réparation reçue 🛠️`
        );
      }

      previousIds.current = newIds;
      setRepairRequests(newWorks);
    } catch (err) {
      console.error("Erreur chargement réparations :", err);
      toast.error("Erreur serveur lors du chargement des réparations.");
    } finally {
      setLoading(false);
    }
  };

  // 📦 Chargement initial
  useEffect(() => {
    if (user?._id) fetchRepairRequests();
  }, [user]);

  // 🔄 Vérification automatique toutes les 30s
  useEffect(() => {
    if (!user?._id) return;
    const interval = setInterval(() => fetchRepairRequests(true), 30000);
    return () => clearInterval(interval);
  }, [user]);

  // 🔹 Comptage par statut
  const counts = {
    tous: repairRequests.length,
    en_attente: repairRequests.filter((n) => n.status === "En attente").length,
    acceptee: repairRequests.filter((n) => n.status === "Accepté").length,
    refusee: repairRequests.filter((n) => n.status === "Refusé").length,
  };

  // 🔍 Recherche + Filtrage
  const filteredRequests = repairRequests
    .filter((n) =>
      filter === "tous"
        ? true
        : (filter === "en_attente" && n.status === "En attente") ||
          (filter === "acceptee" && n.status === "Accepté") ||
          (filter === "refusee" && n.status === "Refusé")
    )
    .filter(
      (n) =>
        n.personId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // 🔢 Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <Navbar />

      <div
        className="container"
        style={{ padding: "30px 20px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <h2 style={{ marginBottom: "25px" }}>📢 Demandes de réparations</h2>

        {/* 🔎 Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par nom du locataire ou par titre..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            marginBottom: "20px",
          }}
        />

        {/* 🧭 Filtres */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "tous", label: "Tous", color: "#4b5563" },
            { key: "en_attente", label: "En attente", color: "#f59e0b" },
            { key: "acceptee", label: "Acceptées", color: "#16a34a" },
            { key: "refusee", label: "Refusées", color: "#dc2626" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => {
                setFilter(btn.key);
                setCurrentPage(1);
              }}
              style={{
                background: filter === btn.key ? btn.color : "white",
                color: filter === btn.key ? "white" : btn.color,
                border: `1px solid ${btn.color}`,
                borderRadius: "6px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              {btn.label} ({counts[btn.key]})
            </button>
          ))}
        </div>

        {/* 🧾 Liste des demandes */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
            <Blocks height="80" width="80" color="#4f46e5" ariaLabel="loading" />
          </div>
        ) : paginatedRequests.length > 0 ? (
          <>
           <div className="notif-card">
  {paginatedRequests.map((req) => (
    <div key={req._id} className="notif-item">
      <p>
        <strong>
          {req.person && req.person._id ? (
            <Link
              to={`/detailUser/${req.person._id}`}
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              {req.createdBy || "Locataire inconnu"}
            </Link>
          ) : (
            req.createdBy || "Locataire inconnu"
          )}
        </strong>{" "}
        a signalé : <strong>{req.title}</strong>
      </p>
      <p>{req.description}</p>

      {req.attachments?.length > 0 && (
        <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
          {req.attachments.map((img, i) => (
            <img
              key={i}
              src={img.startsWith("http") ? img : `https://backend-ged-immo.onrender.com/${img}`}
              alt="photo"
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

      <p style={{ marginTop: "5px" }}>
        <strong>Statut :</strong>{" "}
        <span
          style={{
            color:
              req.status === "Accepté"
                ? "#16a34a"
                : req.status === "Refusé"
                ? "#dc2626"
                : "#f59e0b",
            fontWeight: "bold",
          }}
        >
          {req.status}
        </span>
      </p>

  {req.adminResponse && (
  <>
    <p><strong>Réponse :</strong> {req.adminResponse}</p>
    {req.updatedBy && (
      <p style={{ fontStyle: "italic", fontSize: "14px", marginTop: "3px" }}>
        Réponse donnée par : {req.updatedBy}
      </p>
    )}
  </>
)}

      {req.status === "En attente" && (
        <div style={{ marginTop: "10px" }}>
          <button
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onClick={() => setSelectedWork(req)}
          >
            Répondre
          </button>
        </div>
      )}
    </div>
  ))}
</div>

            {/* 🔢 Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    background: currentPage === i + 1 ? "#4f46e5" : "white",
                    color: currentPage === i + 1 ? "white" : "black",
                    borderRadius: "6px",
                    padding: "6px 10px",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: "#4b5563" }}>Aucune demande trouvée ✅</p>
        )}
      </div>

      {/* 🧱 Modal réponse */}
     {selectedWork && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "450px",
        textAlign: "center",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <h3>🛠️ Répondre à la demande</h3>

      {/* 🔹 Informations sur le locataire */}
      {selectedWork.person && (
        <div
  style={{
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "10px 15px",
    textAlign: "left",
    marginBottom: "15px",
    border: "1px solid #e5e7eb",
  }}
>
  <h4
    style={{
      marginBottom: "8px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#374151",
    }}
  >
    👤 {selectedWork.person.typePersonne === "societe" ? "Société" : "Particulier"}
  </h4>

  {/* Partie pour un particulier */}
  {selectedWork.person.typePersonne === "particulier" && (
    <>
      <p style={{ margin: "3px 0", fontSize: "14px" }}>
        <strong>Nom :</strong> {selectedWork.person.name} {selectedWork.person.lastname || ""}
      </p>
      <p style={{ margin: "3px 0", fontSize: "14px" }}>
        <strong>Date de naissance :</strong> {selectedWork.person.birth || "—"}
      </p>
      <p style={{ margin: "3px 0", fontSize: "14px" }}>
        <strong>Lieu de naissance :</strong> {selectedWork.person.lieu || "—"}
      </p>
      <p style={{ margin: "3px 0", fontSize: "14px" }}>
        <strong>Nationalité :</strong> {selectedWork.person.nationality || "—"}
      </p>
      <p style={{ margin: "3px 0", fontSize: "14px" }}>
        <strong>Sexe :</strong> {selectedWork.person.sexe || "—"}
      </p>
      {selectedWork.person.profession && (
        <p style={{ margin: "3px 0", fontSize: "14px" }}>
          <strong>Profession :</strong> {selectedWork.person.profession}
        </p>
      )}
    </>
  )}

  {/* Partie pour une société */}
  {selectedWork.person.typePersonne === "societe" && (
    <>
      <p style={{ margin: "3px 0", fontSize: "14px" }}>
        <strong>Entreprise :</strong> {selectedWork.person.raisonSociale}
      </p>
      <p style={{ margin: "3px 0", fontSize: "14px" }}>
        <strong>Responsable :</strong> {selectedWork.person.responsable || "—"}
      </p>
      {selectedWork.person.rccm && (
        <p style={{ margin: "3px 0", fontSize: "14px" }}>
          <strong>RCCM :</strong> {selectedWork.person.rccm}
        </p>
      )}
      {selectedWork.person.ifu && (
        <p style={{ margin: "3px 0", fontSize: "14px" }}>
          <strong>IFU :</strong> {selectedWork.person.ifu}
        </p>
      )}
      {selectedWork.person.siegeSocial && (
        <p style={{ margin: "3px 0", fontSize: "14px" }}>
          <strong>Siège social :</strong> {selectedWork.person.siegeSocial}
        </p>
      )}
      {selectedWork.person.domaineActivite && (
        <p style={{ margin: "3px 0", fontSize: "14px" }}>
          <strong>Domaine d'activité :</strong> {selectedWork.person.domaineActivite}
        </p>
      )}
    </>
  )}

  {/* Coordonnées communes */}
  <p style={{ margin: "3px 0", fontSize: "14px" }}>
    <strong>Email :</strong> {selectedWork.person.email || "Non renseigné"}
  </p>
  <p style={{ margin: "3px 0", fontSize: "14px" }}>
    <strong>Téléphone :</strong> {selectedWork.person.tel || "Non renseigné"}
  </p>
</div>
      )}

      {/* 🏠 Informations sur le logement */}
      {selectedWork.home && (
        <div
          style={{
            background: "#f3f4f6",
            borderRadius: "8px",
            padding: "10px 15px",
            textAlign: "left",
            marginBottom: "15px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h4
            style={{
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            🏠 Logement concerné
          </h4>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>
            <strong>Nom :</strong> {selectedWork.home.nameHome || "Non défini"}
          </p>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>
            <strong>Référence :</strong> {selectedWork.home.reference || "—"}
          </p>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>
            <strong>Adresse :</strong> {selectedWork.home.addressHome || "—"}
          </p>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>
            <strong>Ville :</strong> {selectedWork.home.city || "—"}
          </p>
        </div>
      )}

      {/* 🔧 Détails de la demande */}
      <p>
        Voulez-vous <strong>accepter</strong> ou <strong>refuser</strong> la
        réparation suivante ?
      </p>
      <p style={{ fontWeight: "bold", marginTop: "10px" }}>{selectedWork.title}</p>

      {/* 📸 Images envoyées */}
      {selectedWork.attachments?.length > 0 && (
        <div style={{ marginTop: "15px" }}>
          <p style={{ fontWeight: "600", marginBottom: "8px" }}>📷 Images signalées :</p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            {selectedWork.attachments.map((url, i) => (
              <img
                key={i}
                src={url.startsWith("http") ? url : `https://backend-ged-immo.onrender.com/${url}`}
                alt={`Pièce jointe ${i + 1}`}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid #e5e7eb",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                onClick={() =>
                  setSelectedWork({
                    ...selectedWork,
                    lightboxImage: url.startsWith("http")
                      ? url
                      : `https://backend-ged-immo.onrender.com/${url}`,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* 🪟 Lightbox */}
      {selectedWork.lightboxImage && (
        <div
          onClick={() => setSelectedWork({ ...selectedWork, lightboxImage: null })}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
          }}
        >
          <img
            src={selectedWork.lightboxImage}
            alt="Aperçu"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px",
              boxShadow: "0 0 20px rgba(0,0,0,0.6)",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWork({ ...selectedWork, lightboxImage: null });
            }}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              background: "rgba(0,0,0,0.6)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 📝 Formulaire de réponse */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!user?.token) {
            toast.error("❌ Vous n’avez pas l’autorisation pour répondre à cette demande.");
            return;
          }

          if (!selectedWork.newStatus) {
            toast.error("Veuillez choisir Accepter ou Refuser avant d’envoyer ⚠️");
            return;
          }

          const formData = new FormData();
          formData.append("status", selectedWork.newStatus);
          formData.append(
            "adminResponse",
            selectedWork.newStatus === "Accepté"
              ? "Travaux approuvés"
              : "Demande refusée"
          );
          formData.append("adminComment", selectedWork.adminComment || "");
          if (selectedWork.invoiceFile) {
            formData.append("invoice", selectedWork.invoiceFile);
          }

          try {
            const res = await fetch(
              `https://backend-ged-immo.onrender.com/works/${selectedWork._id}/respond`,
              {
                method: "PUT",
                headers: { "Authorization": `Bearer ${user.token}` },
                body: formData,
              }
            );

            const data = await res.json();
            if (res.ok) {
              toast.success(
                `Demande ${selectedWork.newStatus.toLowerCase()}e avec succès ✅`
              );
              setRepairRequests((prev) =>
                prev.map((w) =>
                  w._id === selectedWork._id
                    ? {
                        ...w,
                        status: selectedWork.newStatus,
                        adminResponse: data.adminResponse,
                        adminComment: data.adminComment,
                        invoice: data.invoice,
                        updatedBy: data.updatedBy,
                        updatedAt: data.updatedAt,
                      }
                    : w
                )
              );
              setSelectedWork(null);
            } else {
              toast.error(data.message || "Erreur lors du traitement");
            }
          } catch (err) {
            console.error(err);
            toast.error("Erreur serveur");
          }
        }}
      >
        <textarea
          placeholder="Ajouter un commentaire (facultatif)..."
          value={selectedWork.adminComment || ""}
          onChange={(e) =>
            setSelectedWork({ ...selectedWork, adminComment: e.target.value })
          }
          style={{
            width: "100%",
            minHeight: "80px",
            marginTop: "15px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            padding: "8px",
            resize: "none",
          }}
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setSelectedWork({ ...selectedWork, invoiceFile: e.target.files[0] })
          }
          style={{ marginTop: "10px" }}
        />

        <div
          style={{
            marginTop: "15px",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            style={{
              background:
                selectedWork.newStatus === "Accepté" ? "#16a34a" : "white",
              color:
                selectedWork.newStatus === "Accepté" ? "white" : "#16a34a",
              border: "2px solid #16a34a",
              borderRadius: "6px",
              padding: "8px 12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onClick={() =>
              setSelectedWork({ ...selectedWork, newStatus: "Accepté" })
            }
          >
            ✅ Accepter
          </button>
          <button
            type="button"
            style={{
              background:
                selectedWork.newStatus === "Refusé" ? "#dc2626" : "white",
              color:
                selectedWork.newStatus === "Refusé" ? "white" : "#dc2626",
              border: "2px solid #dc2626",
              borderRadius: "6px",
              padding: "8px 12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onClick={() =>
              setSelectedWork({ ...selectedWork, newStatus: "Refusé" })
            }
          >
            ❌ Refuser
          </button>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "20px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🚀 Envoyer la réponse
        </button>

        <button
          type="button"
          onClick={() => setSelectedWork(null)}
          style={{
            marginTop: "10px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Fermer
        </button>
      </form>
    </div>
  </div>
)}

      <Footer />
    </div>
  );
}