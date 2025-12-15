import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect, useMemo } from "react";
import { TailSpin } from "react-loader-spinner";
import * as XLSX from "xlsx";
import Footer from "./Footer";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";


function isProjectActiveDuringPeriod(project, periodStart, periodEnd) {
  return project.periods?.some(p => {
    const start = new Date(p.start);
    const end = p.end ? new Date(p.end) : new Date(9999, 11, 31);
    return start <= periodEnd && end >= periodStart;
  });
}

export default function Statistiques() {
  const { user, hasFeature, getAuthHeaders } = useUserContext();

  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);

  const [searchProject, setSearchProject] = useState(localStorage.getItem("searchProject") || "");
  const [selectedType, setSelectedType] = useState(localStorage.getItem("selectedType") || "");
  const [projectTypes, setProjectTypes] = useState([]);
  const [searchMonth, setSearchMonth] = useState(localStorage.getItem("searchMonth") || new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(Number(localStorage.getItem("currentPage")) || 1);
  const itemsPerPage = 15;
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const FAR_FUTURE_DATE = new Date(9999, 11, 31, 23, 59, 59, 999);
  

  // -------------------------------------------------------------
  // 🔥 ID ADMIN RÉEL (fix)
  // -------------------------------------------------------------
  const adminId =
    user?.role === "admin"
      ? user._id
      : user?.adminId; // user = agent / gestionnaire → utilise adminId

  // -------------------------------------------------------------
  // 🔥 Sauvegarde localStorage
  // -------------------------------------------------------------
  useEffect(() => { localStorage.setItem("searchProject", searchProject); }, [searchProject]);
  useEffect(() => { localStorage.setItem("selectedType", selectedType); }, [selectedType]);
  useEffect(() => { localStorage.setItem("searchMonth", searchMonth); }, [searchMonth]);
  useEffect(() => { localStorage.setItem("currentPage", currentPage); }, [currentPage]);

  // -------------------------------------------------------------
  // 🔥 Récupération des données
  // -------------------------------------------------------------
useEffect(() => {
  if (!adminId) return;
  setLoading(true);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/data/${adminId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Erreur chargement données");
        return;
      }

      // 🔥 Récupération data propre (comme Project.jsx)
      setProjects(data.projects || []);
      setPersons(data.persons || []);

    } catch (err) {
      toast.error("Erreur serveur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [adminId]);

// -------------------------------------------------------------
// 🔥 Toggle pour afficher les projets archivés (par défaut false)
// -------------------------------------------------------------

// -------------------------------------------------------------
// 🔥 Filtrer les projets en fonction du type et du toggle
// -------------------------------------------------------------
const filteredProjects = useMemo(() => {
  return projects
    .filter(p => showArchived || !p.archived) // Exclure les projets archivés si showArchived = false
    .filter(p => selectedType ? (p.categorie || p.type || "autre").toLowerCase() === selectedType.toLowerCase() : true);
}, [projects, selectedType, showArchived]);

// -------------------------------------------------------------
// 🔥 Déterminer les types de projet à partir des projets filtrés
// -------------------------------------------------------------
useEffect(() => {
  if (projects.length > 0) {
    const activeTypes = projects
      .filter(p => showArchived || !p.archived)
      .map(p => p.categorie || p.type || "autre");
    setProjectTypes([...new Set(activeTypes)]);
  }
}, [projects, showArchived]);


  // -------------------------------------------------------------
  // 🔥 Filtrage locataires (Robuste)
  // -------------------------------------------------------------
// 🔥 Filtrage locataires (Robuste) avec exclusion des projets archivés
const filteredPersons = useMemo(() => {
  if (!Array.isArray(persons) || !Array.isArray(projects)) return [];

  const [year, month] = searchMonth.split("-");
  const monthStart = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
  const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

  return persons
    .filter(p => {
      // --------------------------------------------------
      // 🔹 1. VALIDITÉ TEMPORELLE DU LOCATAIRE
      // --------------------------------------------------
      let tenantStart =
        p.periodStart ||
        p.date_entrance ||
        p.dateEntrance ||
        p.createdAt;

      let tenantEnd =
        p.periodEnd ||
        p.release_date ||
        p.dateArchived ||
        (p.archived ? p.updatedAt : null);

      const start = tenantStart ? new Date(tenantStart) : new Date(0);
      const end = tenantEnd ? new Date(tenantEnd) : new Date(9999, 11, 31);

      if (start > monthEnd || end < monthStart) return false;

      // --------------------------------------------------
      // 🔹 2. PROJET ASSOCIÉ
      // --------------------------------------------------
      const project = projects.find(pr => String(pr._id) === String(p.projectId));
      if (!project) return false;

      const projectArchivedAt = project.archivedAt
        ? new Date(project.archivedAt)
        : project.updatedAt
        ? new Date(project.updatedAt)
        : null;

      if (project.archived) {
        // ❌ jamais après archivage
        if (projectArchivedAt && projectArchivedAt < monthStart) return false;

        // ❌ caché si toggle OFF
        if (!showArchived) return false;
      }

      // --------------------------------------------------
      // 🔹 3. FILTRES UI
      // --------------------------------------------------
      if (searchProject && String(p.projectId) !== String(searchProject)) return false;

      if (
        selectedType &&
        (project.categorie || project.type || "").toLowerCase() !== selectedType.toLowerCase()
      ) {
        return false;
      }

      if (searchTerm) {
        const fullName = `${p.name || ""} ${p.lastname || ""}`.toLowerCase();
        if (!fullName.includes(searchTerm.toLowerCase())) return false;
      }

      return true;
    })
    .map(p => {
      const homesArray = Array.isArray(p.homes)
        ? p.homes.filter(Boolean)
        : p.homeId
        ? [p.homeId]
        : [];

      const rentalForMonth = (p.rentalIds || []).find(r => {
        if (!r?.month) return false;
        const m =
          typeof r.month === "string"
            ? r.month.slice(0, 7)
            : new Date(r.month).toISOString().slice(0, 7);
        return m === searchMonth;
      });

      return { ...p, homesArray, rentalForMonth: rentalForMonth || null };
    });
}, [
  persons,
  projects,
  searchProject,
  selectedType,
  searchTerm,
  searchMonth,
  showArchived,
]);

  const montantTotalImpayé = filteredPersons.reduce(
  (acc, p) =>
    acc + (p.rentalForMonth?.status !== "Payé"
      ? (Number(p.rentalForMonth?.amount) || Number(p.homesArray?.[0]?.rent) || 0)
      : 0),
  0
);

  // -------------------------------------------------------------
  // 🔥 Pagination
  // -------------------------------------------------------------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPersons = filteredPersons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);

  // -------------------------------------------------------------
  // 🔥 Stats
  // -------------------------------------------------------------
  const totalLocataires = filteredPersons.length;
  const totalLoyersPayes = filteredPersons.reduce((acc, p) => acc + (p.rentalForMonth?.status === "Payé" ? 1 : 0), 0);
  const totalLoyersImpayes = filteredPersons.length - totalLoyersPayes;
  const tauxPaiement = totalLocataires ? ((totalLoyersPayes / totalLocataires) * 100).toFixed(1) : 0;

  const montantTotalPaye = filteredPersons.reduce(
    (acc, p) =>
      acc + (p.rentalForMonth?.status === "Payé"
        ? (Number(p.rentalForMonth.amount) || Number(p.homesArray?.[0]?.rent) || 0)
        : 0),
    0
  );

  // -------------------------------------------------------------
  // 🔥 Export Excel
  // -------------------------------------------------------------
  const exportExcel = () => {
    if (!filteredPersons.length) {
      toast.error("Aucune donnée à exporter !");
      return;
    }

    const projectName =
      projects.find(p => p._id === searchProject)?.name || "Tous les projets";

    const header = [
      [`Rapport Locataires - Projet : ${projectName}`],
      [`Mois : ${searchMonth}`],
      [""],
      ["Nom & Prénom(s)", "Contact", "Bien", "Pièces", "Mois", "Statut", "Montant (FCFA)"],
    ];

    const body = filteredPersons.map(p => {
      const month = p.rentalForMonth
        ? new Date(p.rentalForMonth.month).toLocaleString("fr-FR", { month: "long", year: "numeric" })
        : "N/A";

      const montant = p.homesArray?.[0]?.rent || p.rentalForMonth?.amount || 0;

      return [
        `${p.name} ${p.lastname}`,
        p.tel || "",
        p.homesArray?.[0]?.categorie || "",
        p.homesArray?.[0]?.NmbrePieces || "",
        month,
        p.rentalForMonth?.status || "Impayé",
        montant,
      ];
    });

    const footer = [
      [""],
      ["TOTAL LOCATAIRES", totalLocataires],
      ["LOYERS PAYÉS", totalLoyersPayes],
      ["LOYERS IMPAYÉS", totalLoyersImpayes],
      ["TAUX DE PAIEMENT (%)", `${tauxPaiement}%`],
      ["MONTANT PAYÉ (FCFA)", montantTotalPaye],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body, ...footer]);
    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locataires");

    const monthLabel = searchMonth.replace("-", "_");
    XLSX.writeFile(workbook, `Rapport_Locataires_${projectName}_${monthLabel}.xlsx`);
  };

  // -------------------------------------------------------------
  // 🔥 UI
  // -------------------------------------------------------------


  // -------------------------------------------------------------
// 🔥 Toggle pour afficher les projets archivés (par défaut false)
// -------------------------------------------------------------


// -------------------------------------------------------------
// 🔥 Filtrer les projets en fonction du toggle
// -------------------------------------------------------------


// -------------------------------------------------------------
// 🔥 Déterminer les types de projet à partir des projets filtrés
// -------------------------------------------------------------
useEffect(() => {
  if (projects.length > 0) {
    const activeTypes = projects
      .filter(p => showArchived || !p.archived)
      .map(p => p.categorie || p.type || "autre");
    setProjectTypes([...new Set(activeTypes)]);
  }
}, [projects, showArchived]);
  return (
    <div>
      <Navbar />
      <div className="saas-container">
        {loading ? (
          <div className="loading"><TailSpin height="80" width="80" color="#4fa94d" /></div>
        ) : (
          <div className="saas-card">
            
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/Accueil">Accueil</Link></li>
                <li>Statistiques</li>
              </ol>
            </nav>

            {/* HEADER */}
            <div className="header-actions">
              <h2><i className="fa-solid fa-chart-line"></i> Rapport & Statistiques</h2>

              <button
                className={`export-excel ${hasFeature("exportAllowed") ? "enabled" : "disabled"}`}
                disabled={!hasFeature("exportAllowed")}
                onClick={() => hasFeature("exportAllowed") && exportExcel()}
              >
                <i className="fa-solid fa-file-excel"></i> Export Excel
              </button>
            </div>

            {/* FILTRES */}
            <div className="filter-section">

                   <div className="archive-toggle">
                    <span className="toggle-label">Afficher projets archivés</span>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={() => setShowArchived(!showArchived)}
                      />
                      <span className="slider" />
                    </label>
                  </div>

              <select
                className="select-field"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSearchProject("");
                  setCurrentPage(1);
                }}
              >
                <option value="">Tous les types</option>
                {projectTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <select
                className="select-field"
                value={searchProject}
                onChange={(e) => {
                  setSearchProject(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Toutes les propriétés</option>
                {filteredProjects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>

              <input
                type="month"
                className="select-field"
                value={searchMonth}
                onChange={(e) => {
                  setSearchMonth(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <input
                type="text"
                placeholder="Rechercher un locataire..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />


            </div>

            {/* STATISTIQUES */}
            <div style={{ marginBottom: "1rem", fontWeight: "500" }}>
              📅 Statistiques du mois : {new Date(searchMonth + "-01").toLocaleString("fr-FR", { month: "long", year: "numeric" })}
            </div>

            <div className="dashboard-cards">
              <div className="card card-primary">
                <div className="card-header">
                  <i className="fa-solid fa-users fa-lg"></i>
                  <h4>Locataires ce mois</h4>
                </div>
                <span>{totalLocataires}</span>
              </div>

              <div className="card card-success">
                <div className="card-header">
                  <i className="fa-solid fa-money-bill-wave fa-lg"></i>
                  <h4>Loyers payés</h4>
                </div>
                <span>{totalLoyersPayes}</span>
              </div>

              <div className="card card-danger">
                <div className="card-header">
                  <i className="fa-solid fa-triangle-exclamation fa-lg"></i>
                  <h4>Loyers impayés</h4>
                </div>
                <span>{totalLoyersImpayes}</span>
              </div>

              <div className="card card-info">
                <div className="card-header">
                  <i className="fa-solid fa-percent fa-lg"></i>
                  <h4>Taux de paiement</h4>
                </div>
                <span>{tauxPaiement}%</span>
              </div>

              <div className="card card-warning">
  <div className="card-header">
    <i className="fa-solid fa-money-bill-wave fa-lg"></i>
    <h4>Montant impayé</h4>
  </div>
  <span>{montantTotalImpayé.toLocaleString("fr-FR")} FCFA</span>
</div>

              <div className="card card-success">
                <div className="card-header">
                  <i className="fa-solid fa-hand-holding-dollar fa-lg"></i>
                  <h4>Montant payé</h4>
                </div>
                <span>{montantTotalPaye.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>

            {/* TABLEAU */}
            <div className="payment-section">
              <h3>Détails des paiements</h3>

              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Nom & Prénom(s)</th>
                    <th>Contacts</th>
                    <th>Bien</th>
                    <th>Nb pièces</th>
                    <th>Mois</th>
                    <th>Statut</th>
                    <th>Montant</th>
                    <th>Détails</th>
                  </tr>
                </thead>

                <tbody>
                  {currentPersons.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        {searchProject
                          ? "Aucun locataire pour ce projet."
                          : "Veuillez sélectionner une propriété pour voir les locataires."}
                      </td>
                    </tr>
                  ) : (
                    currentPersons.map(p => (
                      <tr key={p._id}>
                        <td>{p.name} {p.lastname}</td>
                        <td>{p.tel}</td>
                        <td>{p.homesArray?.[0]?.categorie || "N/A"}</td>
                        <td>{p.homesArray?.[0]?.NmbrePieces || "N/A"}</td>
                        <td>
                          {p.rentalForMonth
                            ? new Date(p.rentalForMonth.month).toLocaleString("fr-FR", { month: "long", year: "numeric" })
                            : "N/A"}
                        </td>
                        <td>
                          <span className={`status ${p.rentalForMonth?.status === "Payé" ? "paid" : "pending"}`}>
                            {p.rentalForMonth?.status || "Impayé"}
                          </span>
                        </td>
                        <td>{p.homesArray?.[0]?.rent || p.rentalForMonth?.amount || "N/A"} FCFA</td>
                        <td>
                          <Link to={`/detailUser/${p._id}`}>
                            <button className="btn-details">Détails</button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={currentPage === i + 1 ? "active" : ""}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <Toaster position="top-right" reverseOrder={false} />

      {/* --- CSS intégré --- */}
      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .loading { display: flex; justify-content: center; align-items: center; height: 60vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .breadcrumb ol { display: flex; list-style: none; padding: 0; gap: .5rem; font-size: 14px; }
        .breadcrumb a { text-decoration: none; color: #2563eb; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .filter-section { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .search-input, .select-field { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .dashboard-cards { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
        .card { padding: 1rem; border-radius: 8px; color: #fff; text-align: center; width: 220px; }
        .card-header { display: flex; flex-direction: column; align-items: center; margin-bottom: .5rem; }
        .card-primary { background: #3b82f6; }
        .card-success { background: #22c55e; }
        .card-danger { background: #ef4444; }
        .card-info { background: #06b6d4; }
        .payment-section h3 { margin-bottom: 1rem; }
        .payment-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .payment-table th, .payment-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .payment-table th { background: #f1f5f9; }
        .status { padding: .2rem .6rem; border-radius: 12px; font-size: 12px; }
        .status.paid { background: #dcfce7; color: #166534; }
        .status.pending { background: #fee2e2; color: #991b1b; }
        .btn-details { padding: .3rem .6rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
        .btn-details:hover { background: #1e40af; }
        .pagination { margin-top: 1.5rem; display: flex; gap: .3rem; justify-content: center; }
        .pagination button { padding: .4rem .8rem; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; background: #fff; }
        .pagination button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
       /* Bouton Export Excel - état général */
button.export-excel {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
}

/* Autorisation accordée - bouton actif */
button.export-excel.enabled {
  background-color: #16a34a; /* vert */
  color: #fff;
}

button.export-excel.enabled:hover {
  background-color: #138f3f;
  transform: scale(1.05);
}

/* Pas d'autorisation - bouton désactivé */
button.export-excel.disabled {
  background-color: #a1a1aa; /* gris clair */
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}
  .archive-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* Switch container */
.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
}

/* Hide default checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* Slider */
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: 0.25s ease;
  border-radius: 999px;
}

/* Knob */
.slider::before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 2px;
  top: 2px;
  background-color: #fff;
  transition: 0.25s ease;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* Checked state */
.switch input:checked + .slider {
  background-color: #2563eb; /* bleu SaaS */
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

      `}</style>
    </div>
  );
}