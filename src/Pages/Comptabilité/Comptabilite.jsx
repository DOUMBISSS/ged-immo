import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useState, useEffect, useMemo } from "react";
import { TailSpin } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../../contexts/UserContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function ComptabiliteTendance() {
  const { user, hasFeature } = useUserContext();

  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [searchMonth, setSearchMonth] = useState(localStorage.getItem("searchMonth") || currentMonth);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(localStorage.getItem("selectedType") || "");
  const [projectTypes, setProjectTypes] = useState([]);

  // --- Sauvegarde localStorage ---
  useEffect(() => { localStorage.setItem("searchMonth", searchMonth); }, [searchMonth]);
  useEffect(() => { localStorage.setItem("selectedType", selectedType); }, [selectedType]);

  // --- Récupération des données ---
  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);

    const fetchAllData = async () => {
      try {
        const [projectsRes, personsRes] = await Promise.all([
          fetch(`https://backend-ged-immo.onrender.com/projects/admin/${user._id}`, {
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
          }),
          fetch(`https://backend-ged-immo.onrender.com/locataire/${user._id}`, {
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
          }),
        ]);

        const projectsData = await projectsRes.json();
        const personsData = await personsRes.json();

        if (projectsData.success) setProjects(projectsData.projects || []);
        setPersons(personsData || []);
      } catch (err) {
        toast.error("Erreur serveur : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // --- Déterminer les types de projet disponibles ---
  useEffect(() => {
    if (projects.length > 0) {
      const types = [...new Set(projects.map(p => p.categorie || p.type || "autre"))];
      setProjectTypes(types);
    }
  }, [projects]);

// --- Calcul analytique par projet (corrigé avec periodStart / periodEnd) ---
// --- Calcul analytique par projet (Version finale : identique à filteredPersons) ---
const projectStats = useMemo(() => {
  if (!projects.length || !persons.length) return [];

  const formattedMonth = searchMonth || currentMonth;

  // Bornes du mois sélectionné
  const [year, month] = formattedMonth.split("-");
  const monthStart = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
  const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

  return projects
    .filter(p => !selectedType || (p.categorie || p.type || "autre") === selectedType)
    .map((proj) => {

      // --- 1) Locataires appartenant à ce projet (correct & simple)
      const locsDuProjet = persons.filter(p =>
        p.projectId && String(p.projectId) === String(proj._id)
      );

      // --- 2) Filtrer les locataires actifs dans ce mois EXACTEMENT comme filteredPersons
      const locsActifs = locsDuProjet.filter(p => {

        let start =
          p.periodStart ? new Date(p.periodStart) :
          p.date_entrance ? new Date(p.date_entrance) :
          p.dateEntrance ? new Date(p.dateEntrance) :
          p.createdAt ? new Date(p.createdAt) :
          new Date(0);

        let end =
          p.periodEnd ? new Date(p.periodEnd) :
          p.dateArchived ? new Date(p.dateArchived) :
          p.release_date ? new Date(p.release_date) :
          (p.archived ? (p.updatedAt ? new Date(p.updatedAt) : new Date()) : null);

        if (!end) end = new Date(9999, 11, 31, 23, 59, 59, 999);

        if (isNaN(start.getTime())) start = new Date(0);
        if (isNaN(end.getTime())) end = new Date(9999, 11, 31, 23, 59, 59, 999);

        return start <= monthEnd && end >= monthStart;
      });

      const totalLocataires = locsActifs.length;

      // --- 3) Loyer du mois
      const locsWithRent = locsActifs.map((p) => {
        const rentalForMonth = (p.rentalIds || []).find((rent) => {
          if (!rent?.month) return false;
          const rentMonth = typeof rent.month === "string"
            ? rent.month.slice(0, 7)
            : new Date(rent.month).toISOString().slice(0, 7);
          return rentMonth === formattedMonth;
        });
        return { ...p, rentalForMonth };
      });

      // --- 4) Calculs comptables
      const loyersPayes = locsWithRent.filter(p => p.rentalForMonth?.status === "Payé").length;
      const loyersImpayes = totalLocataires - loyersPayes;

      const revenus = locsWithRent.reduce((acc, p) => {
        if (p.rentalForMonth?.status === "Payé") {
          return acc + (Number(p.rentalForMonth.amount) || 0);
        }
        return acc;
      }, 0);

      const tauxPaiement =
        totalLocataires > 0
          ? ((loyersPayes / totalLocataires) * 100).toFixed(1)
          : 0;

      return {
        projectName: proj.name,
        totalLocataires,
        loyersPayes,
        loyersImpayes,
        tauxPaiement,
        revenus
      };
    })

    // --- Si aucun locataire actif → ne pas afficher le projet
    .filter((p) => p.totalLocataires > 0);

}, [projects, persons, searchMonth, selectedType, currentMonth]);

  const totalGlobal = projectStats.reduce((acc, p) => acc + p.revenus, 0);
  const totalLocataires = projectStats.reduce((acc, p) => acc + p.totalLocataires, 0);
  const totalPayes = projectStats.reduce((acc, p) => acc + p.loyersPayes, 0);
  const totalImpayes = projectStats.reduce((acc, p) => acc + p.loyersImpayes, 0);
  const avgTauxPaiement = totalLocataires ? ((totalPayes / totalLocataires) * 100).toFixed(1) : 0;
  const totalImpayesRevenus = projectStats.reduce((acc, p) => {
    const impayes = p.loyersImpayes;
    const montantImpayes = p.loyersPayes ? (p.revenus / p.loyersPayes * impayes) : 0;
    return acc + montantImpayes;
  }, 0);

  // --- Données Chart.js ---
  const combinedChartData = {
    labels: projectStats.map(p => p.projectName),
    datasets: [
      { type: 'bar', label: 'Total locataires', data: projectStats.map(p => p.totalLocataires), backgroundColor: '#3498db' },
      { type: 'bar', label: 'Loyers payés', data: projectStats.map(p => p.loyersPayes), backgroundColor: '#2ecc71' },
      { type: 'bar', label: 'Loyers impayés', data: projectStats.map(p => p.loyersImpayes), backgroundColor: '#e74c3c' },
      { type: 'line', label: 'Taux paiement (%)', data: projectStats.map(p => p.tauxPaiement), borderColor: '#f1c40f', backgroundColor: 'rgba(241, 196, 15, 0.2)', yAxisID: 'y1', tension: 0.3, fill: false, pointRadius: 5 },
      { type: 'line', label: 'Revenus (FCFA)', data: projectStats.map(p => p.revenus), borderColor: '#8e44ad', backgroundColor: 'rgba(142, 68, 173, 0.2)', yAxisID: 'y2', tension: 0.3, fill: false, pointRadius: 5 },
    ],
  };

  const combinedChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Nombre de locataires' } },
      y1: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'Taux de paiement (%)' }, grid: { drawOnChartArea: false } },
      y2: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'Revenus (FCFA)' }, grid: { drawOnChartArea: false }, offset: true },
    },
  };

  // --- Export Excel / PDF ---
  const exportExcel = () => {
    if (!projectStats.length) return toast.error("Aucune donnée à exporter !");
    const header = [["Analyse Comptable - Mois : " + searchMonth], [""], ["Projet", "Locataires", "Loyers Payés", "Loyers Impayés", "Taux Paiement (%)", "Revenus (FCFA)", "Revenus Impayés (FCFA)"]];
    const body = projectStats.map(p => [
      p.projectName,
      p.totalLocataires,
      p.loyersPayes,
      p.loyersImpayes,
      p.tauxPaiement,
      p.revenus,
      p.loyersPayes ? (p.revenus / p.loyersPayes * p.loyersImpayes) : 0,
    ]);
    const totalRow = ["TOTAL GÉNÉRAL", "", "", "", "", totalGlobal, totalImpayesRevenus];
    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body, [""], totalRow]);
    worksheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 22 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comptabilité");
    XLSX.writeFile(workbook, `Analyse_Comptabilite_${searchMonth.replace("-", "_")}.xlsx`);
  };

  return (
    <div>
      <Navbar />
      <div className="saas-container">
        {loading ? <div className="loading"><TailSpin height="80" width="80" color="#4fa94d" /></div> : (
          <div className="saas-card">
            <nav aria-label="breadcrumb" className="breadcrumb">
              <ol><li><Link to="/Accueil">Accueil</Link></li><li>Comptabilité</li></ol>
            </nav>

            <div className="header-actions">
              <h2><i className="fa-solid fa-chart-column"></i> Analyse par projet</h2>
              <div className="export-buttons">
                <button className={`export-excel ${hasFeature("exportAllowed") ? "enabled" : "disabled"}`} disabled={!hasFeature("exportAllowed")} onClick={exportExcel}>
                  <i className="fa-solid fa-file-excel"></i> Export Excel
                </button>
              </div>
            </div>

            <div className="filter-section">
              <select className="select-field" value={selectedType} onChange={e => { setSelectedType(e.target.value); setSearchMonth(searchMonth); }}>
                <option value="">Tous les types</option>
                {projectTypes.map((type, idx) => (<option key={idx} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}
              </select>
              <input type="month" value={searchMonth} onChange={e => setSearchMonth(e.target.value)} className="select-field" />
            </div>

            <div className="indicators">
              <div className="indicator">💰 Revenus : {totalGlobal.toLocaleString("fr-FR")} FCFA</div>
              <div className="indicator">👥 Total locataires : {totalLocataires}</div>
              <div className="indicator">✅ Loyers payés : {totalPayes}</div>
              <div className="indicator">❌ Loyers impayés : {totalImpayes}</div>
              <div className="indicator">📊 Taux paiement : {avgTauxPaiement}%</div>
            </div>

            <div className="chart-container">
              <h3>Analyse complète par projet</h3>
              <Chart type='bar' data={combinedChartData} options={combinedChartOptions} />
            </div>

            <div className="payment-section">
              <h3>Performances des projets</h3>
              <table className="payment-table">
                <thead>
                  <tr><th>Projet</th><th>Locataires</th><th>Loyers payés</th><th>Loyers impayés</th><th>Taux paiement</th><th>Revenus impayés (FCFA)</th><th>Revenus (FCFA)</th></tr>
                </thead>
                <tbody>
                  {projectStats.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center" }}>Aucune donnée pour ce mois.</td></tr>
                  ) : projectStats.map((p, i) => (
                    <tr key={i}>
                      <td>{p.projectName}</td>
                      <td>{p.totalLocataires}</td>
                      <td style={{ color: "#16a34a", fontWeight: 600 }}>{p.loyersPayes}</td>
                      <td style={{ color: "#dc2626", fontWeight: 600 }}>{p.loyersImpayes}</td>
                      <td>{p.tauxPaiement}%</td>
                      <td style={{ color: "#dc2626" }}>{(p.loyersPayes ? (p.revenus / p.loyersPayes * p.loyersImpayes) : 0).toLocaleString("fr-FR")}</td>
                      <td>{p.revenus.toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
                {projectStats.length > 0 && (
                  <tfoot>
                    <tr style={{ fontWeight: "600", background: "#f9fafb" }}>
                      <td colSpan="5" style={{ textAlign: "right" }}>Total Général :</td>
                      <td style={{ color: "#dc2626" }}>{totalImpayesRevenus.toLocaleString("fr-FR")} FCFA</td>
                      <td>{totalGlobal.toLocaleString("fr-FR")} FCFA</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <Toaster position="top-right" reverseOrder={false} />

      <style>{`
        .saas-container { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        .loading { display: flex; justify-content: center; align-items: center; height: 60vh; }
        .saas-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); padding: 2rem; }
        .breadcrumb ol { display: flex; list-style: none; padding: 0; gap: .5rem; font-size: 14px; }
        .breadcrumb a { text-decoration: none; color: #2563eb; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: .5rem; }
        .export-buttons { display: flex; gap: .5rem; }
        .btn-export { border: none; border-radius: 6px; padding: .4rem .8rem; color: #fff; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: .4rem; }
        .btn-export.excel { background: #16a34a; }
        .btn-export.pdf { background: #dc2626; }
        .btn-export:hover { opacity: 0.9; }
        .filter-section { margin-bottom: 1.5rem; }
        .select-field { padding: .5rem 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
        .indicators { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
        .indicator { background: #eef2ff; padding: .6rem 1rem; border-radius: 8px; font-weight: 600; flex: 1; min-width: 160px; text-align: center; }
        .chart-container { margin-bottom: 2rem; background: #fff; padding: 1rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .payment-section h3, .recent-payments h3 { margin-bottom: 1rem; font-weight: 600; color: #1e293b; }
        .payment-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 2rem; }
        .payment-table th, .payment-table td { border: 1px solid #e5e7eb; padding: .8rem; text-align: left; }
        .payment-table th { background: #f1f5f9; color: #111827; }
        .payment-table tr:nth-child(even) { background-color: #f9fafb; }
        .payment-table tr:hover { background-color: #eef2ff; transition: background 0.2s ease-in-out; }
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
      `}</style>
    </div>
  );
}