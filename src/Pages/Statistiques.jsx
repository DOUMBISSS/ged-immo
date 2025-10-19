import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect, useMemo } from "react";
import { TailSpin } from "react-loader-spinner";

import Footer from "./Footer";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";

export default function Statistiques() {
  const { id } = useParams();
  const { user } = useUserContext();

  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);
  const [searchProject, setSearchProject] = useState(localStorage.getItem("searchProject") || "");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [searchMonth, setSearchMonth] = useState(localStorage.getItem("searchMonth") || currentMonth);
  const [loading, setLoading] = useState(true);
  const [newPeople, setNewPeople] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleSearchMonth = (e) => {
    setSearchMonth(e.target.value);
    localStorage.setItem("searchMonth", e.target.value);
    setCurrentPage(1);
  };

  const handleProjectChange = (e) => {
    setSearchProject(e.target.value);
    localStorage.setItem("searchProject", e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!user?._id) return;
  
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/data/${user._id}`);
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
  const handlePageChange = (page) => setCurrentPage(page);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetch(`http://localhost:4000/projects/admin/${user._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects || []);
      })
      .catch((err) => toast.error("Erreur récupération projets : " + err.message))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetch(`http://localhost:4000/locataire/${user._id}`)
      .then((res) => res.json())
      .then((data) => setPersons(data || []))
      .catch((err) => toast.error("Erreur récupération locataires : " + err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // --- Filtrage et normalisation du mois ---
const filteredPersons = useMemo(() => {
  if (!searchProject) return [];

  const formattedMonth = searchMonth || currentMonth;

  return persons
    .filter((person) => {
      if (person.archived) return false;

      const homesArray = Array.isArray(person.homes)
        ? person.homes
        : person.homeId
        ? [person.homeId]
        : [];

      const belongsToProject = homesArray.some(
        (home) =>
          String(home.projectId || home.project_id || home.project) ===
          String(searchProject)
      );

      const matchesSearch = `${person.name || ""} ${person.prenom || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return belongsToProject && matchesSearch;
    })
    .map((person) => {
      const homesArray = Array.isArray(person.homes)
        ? person.homes
        : person.homeId
        ? [person.homeId]
        : [];

      // 🔹 Correction ici : rentalIds au lieu de rentals
      const rentalForMonth = person.rentalIds?.find((rent) => {
        if (!rent.month) return false;

        let rentMonth;
        if (typeof rent.month === "string") {
          rentMonth = rent.month.slice(0, 7);
        } else {
          rentMonth = new Date(rent.month).toISOString().slice(0, 7);
        }

        return rentMonth === formattedMonth;
      });

      return { ...person, rentalForMonth, homesArray };
    });
}, [persons, searchMonth, searchProject, searchTerm, currentMonth]);

  // --- Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPersons = filteredPersons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);

  // --- Statistiques globales ---
  const totalLocataires = filteredPersons.length;
  const totalLoyersPayes = filteredPersons.reduce(
    (acc, p) => acc + (p.rentalForMonth?.status === "Payé" ? 1 : 0),
    0
  );
  const totalLoyersImpayes = filteredPersons.reduce(
    (acc, p) => acc + (p.rentalForMonth?.status !== "Payé" ? 1 : 0),
    0
  );
  const tauxPaiement =
    totalLoyersPayes + totalLoyersImpayes > 0
      ? ((totalLoyersPayes / (totalLoyersPayes + totalLoyersImpayes)) * 100).toFixed(1)
      : 0;

  const montantTotalPaye = filteredPersons.reduce((acc, p) => {
    if (p.rentalForMonth?.status === "Payé") {
      return acc + (Number(p.rentalForMonth.amount) || Number(p.homesArray?.[0]?.rent) || 0);
    }
    return acc;
  }, 0);

  const montantTotalImpayes = filteredPersons.reduce((acc, p) => {
    if (p.rentalForMonth && p.rentalForMonth?.status !== "Payé") {
      return acc + (Number(p.rentalForMonth.amount) || Number(p.homesArray?.[0]?.rent) || 0);
    }
    return acc;
  }, 0);

  // --- Affichage ---
  return (
    <div>
      <Navbar />
      <div className="saas-container">
        {loading ? (
          <div className="loading">
            <TailSpin height="80" width="80" color="#4fa94d" />
          </div>
        ) : (
          <div className="saas-card">
            <nav aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li>
                  <Link to="/Accueil">Accueil</Link>
                </li>
                <li>Statistiques</li>
              </ol>
            </nav>

            <div className="header-actions">
              <h2>
                <i className="fa-solid fa-chart-line"></i> Rapport & Statistiques
              </h2>
            </div>

          

            {/* Filtres */}
            <div className="filter-section">
              <select
                className="select-field"
                value={searchProject}
                onChange={handleProjectChange}
              >
                <option value="">Toutes les propriétés</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <input
                type="month"
                value={searchMonth}
                onChange={handleSearchMonth}
                className="select-field"
              />

              <input
                type="text"
                placeholder="Rechercher un locataire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div style={{ marginBottom: "1rem", fontWeight: "500" }}>
              📅 Statistiques du mois :{" "}
              {new Date(searchMonth + "-01").toLocaleString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </div>

            {/* Cartes Statistiques */}
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

              <div className="card card-success">
                <div className="card-header">
                  <i className="fa-solid fa-hand-holding-dollar fa-lg"></i>
                  <h4>Montant payé</h4>
                </div>
                <span>{montantTotalPaye.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>

            {/* Tableau */}
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
                  {!searchProject || filteredPersons.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        Veuillez sélectionner une propriété pour voir les locataires.
                      </td>
                    </tr>
                  ) : (
                    currentPersons.map((person) => (
                      <tr key={person._id}>
                        <td>{person.name} {person.lastname}</td>
                        <td>{person.tel}</td>
                        <td>{person.homesArray?.[0]?.categorie}</td>
                        <td>{person.homesArray?.[0]?.NmbrePieces || "N/A"}</td>
                        <td>
                      {person.rentalForMonth
                        ? new Date(person.rentalForMonth.month).toLocaleString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`status ${
                          person.rentalForMonth?.status === "Payé" ? "paid" : "pending"
                        }`}
                      >
                        {person.rentalForMonth?.status || "Impayé"}
                      </span>
                    </td>
                        <td>{person.homesArray?.[0]?.rent || "N/A"} FCFA</td>
                        <td>
                          <Link to={`/detailUser/${person._id}`}>
                            <button className="btn-details">Détails</button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
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
      `}</style>
    </div>
  );
}