import { Link } from "react-router-dom";
import Navbar from "../Pages/Navbar";
import Footer from "../Pages/Footer";
import { useState, useEffect, useMemo } from "react";
import { TailSpin } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";
import * as XLSX from "xlsx";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { ArcElement, DoughnutController } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,          // <-- ajouté pour Doughnut
  DoughnutController,  // <-- ajouté pour Doughnut
  Title,
  Tooltip,
  Legend
);

function isProjectActiveDuringPeriod(project, periodStart, periodEnd) {
  return project.periods?.some(p => {
    const start = new Date(p.start);
    const end = p.end ? new Date(p.end) : new Date(9999, 11, 31);
    return start <= periodEnd && end >= periodStart;
  });
}

export default function Accueil() {
  const { user, hasFeature, getAuthHeaders } = useUserContext();
  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
const [searchMonth, setSearchMonth] = useState(localStorage.getItem("searchMonth") || new Date().toISOString().slice(0, 7));
  const [selectedType, setSelectedType] = useState(localStorage.getItem("selectedType") || "");
  const [projectTypes, setProjectTypes] = useState([]);
// const [currentMonth, setCurrentMonth] = useState(() => {const now = new Date();return now.toISOString().slice(0, 7);});
const currentMonth = "2025-12";
const [year, month] = currentMonth.split("-");
const periodStart = new Date(Number(year), Number(month) - 1, 1);
const periodEnd = new Date(Number(year), Number(month), 0, 23, 59, 59);
const currentMonthLabel = new Date(currentMonth + "-01").toLocaleString("fr-FR", { month: "long", year: "numeric" });

const activeProjects = useMemo(() => {
  return projects.filter(project =>
    isProjectActiveDuringPeriod(project, periodStart, periodEnd)
  );
}, [projects, periodStart, periodEnd]);

// 🔹 Filtrage locataires pour le mois (VERSION ROBUSTE)
const filteredPersons = useMemo(() => {
  if (!persons.length) return [];

  const [year, month] = currentMonth.split("-");
  const monthStart = new Date(Number(year), Number(month) - 1, 1);
  const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59);

  return persons
    .map(p => {
      // 🔍 Trouver l'entrée EXACTE du mois AAAA-MM dans rentalIds
      const thisMonthRent = (p.rentalIds || []).find(r => {
        if (!r?.month) return false;

        const rentMonth = String(r.month).slice(0, 7); // Gère string, date, timestamp
        return rentMonth === currentMonth;
      });

      return {
        ...p,
        rentalForMonth: thisMonthRent || null   // 👍 Toujours défini
      };
    })
    .filter(p => {
      // 🔍 Vérifier si le locataire était présent ce mois-là
      const start = p.date_entrance ? new Date(p.date_entrance) : new Date(0);
      const end = p.release_date 
        ? new Date(p.release_date) 
        : (p.archived ? new Date() : new Date(9999, 11, 31));

      return start <= monthEnd && end >= monthStart;
    });
}, [persons, currentMonth]);


const activeProjectIds = useMemo(
  () => activeProjects.map(p => String(p._id)),
  [activeProjects]
);
  const filteredPersonsActiveProjects = useMemo(() => {
  return filteredPersons.filter(p =>
    activeProjectIds.includes(String(p.projectId))
  );
}, [filteredPersons, activeProjectIds]);





  const adminId = user?.role === "admin" ? user._id : user?.adminId;
  useEffect(() => { localStorage.setItem("searchMonth", searchMonth); }, [searchMonth]);
  useEffect(() => { localStorage.setItem("selectedType", selectedType); }, [selectedType]);

  // 🔹 Récupération des données
useEffect(() => {
  if (!adminId) return;
  setLoading(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:4000/data/${adminId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!data.success) { 
        toast.error(data.message || "Erreur chargement données"); 
        return; 
      }
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

  // 🔹 Types de projet
  useEffect(() => {
    if (projects.length > 0) {
      const types = [...new Set(projects.map(p => p.type || p.categorie || "autre"))];
      setProjectTypes(types);
    }
  }, [projects]);
  



function getMontantLoyer(p) {
  // 1️⃣ Si snapshot existe (locataire a déjà payé un jour)
  if (p.rentalForMonth?.amount !== undefined) {
    return Number(p.rentalForMonth.amount);
  }

  // 2️⃣ Sinon utiliser le loyer actuel du logement
  if (p.homes?.length && p.homes[0].rent) {
    return Number(p.homes[0].rent);
  }

  // 3️⃣ Sinon fallback sur p.loyer (ton ancien champ)
  if (p.loyer) return Number(p.loyer);

  return 0;
}

 // 🔹 KPI principaux
const totalLocataires = filteredPersonsActiveProjects.length;

const totalLoyersPayes = filteredPersonsActiveProjects.filter(p => p.rentalForMonth?.status === "Payé").length;
const totalLoyersImpayesCount =
  filteredPersonsActiveProjects.filter(
    p => !p.rentalForMonth || p.rentalForMonth.status !== "Payé"
  ).length;

const montantTotalPaye = filteredPersonsActiveProjects.reduce((acc, p) => {
  const rent = p.rentalForMonth;
  if (rent?.status === "Payé") acc += Number(rent.amount || 0);
  return acc;
}, 0);

// 🔹 Montant IMPAYÉ du mois (FIXÉ)
const montantTotalImpayes = filteredPersonsActiveProjects.reduce((acc, p) => {
  if (p.rentalForMonth?.status === "Payé") return acc;
  return acc + getMontantLoyer(p);
}, 0);
const montantTotalLoyers = montantTotalPaye + montantTotalImpayes;

const tauxPaiement = totalLocataires ? ((totalLoyersPayes / totalLocataires) * 100).toFixed(1) : 0;
const pourcentageImpayes = montantTotalLoyers ? ((montantTotalImpayes / montantTotalLoyers) * 100).toFixed(1) : 0;
const loyerMoyenPayes = totalLoyersPayes ? (montantTotalPaye / totalLoyersPayes).toFixed(0) : 0;
const loyerMoyenTotal = totalLocataires ? (montantTotalLoyers / totalLocataires).toFixed(0) : 0;
 const nbProjetsActifs = activeProjects.length;
  // On parcourt tous les locataires de tous les projets
const montantGlobalTousProjets = persons.reduce((acc, p) => {
  const loyersPayes = (p.rentalIds || [])
    .filter(r => r.status === "Payé") // on prend tous les paiements
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  return acc + loyersPayes;
}, 0);

// 🔹 Montants globaux actualisés pour le mois courant
const montantTotalLoyersGlobal = persons.reduce((acc, p) => {
  const loyersAttendus = (p.rentalIds || [])
    .filter(r => r?.month?.slice(0,7) === currentMonth)
    .reduce((sum, r) => sum + Number(r.amount || getMontantLoyer(p) || 0), 0);
  return acc + loyersAttendus;
}, 0);

const montantTotalPayeGlobal = montantGlobalTousProjets; // déjà calculé

const tauxPaiementGlobal = montantTotalLoyersGlobal
  ? ((montantTotalPayeGlobal / montantTotalLoyersGlobal) * 100).toFixed(1)
  : 0;



// console.log("Montant global de tous les loyers payés:", montantGlobalTousProjets);

  // Locataires par type de projet
  const locsByType = {};
  activeProjects.forEach(p => {
    const locsCount = filteredPersons.filter(per => String(per.projectId) === String(p._id)).length;
    const type = p.type || "Autre";
    locsByType[type] = (locsByType[type] || 0) + locsCount;
  });




const projectStats = useMemo(() => {
  return activeProjects.map(p => {
    const locs = filteredPersons.filter(per => String(per.projectId) === String(p._id));

    const payes = locs.filter(l => l.rentalForMonth?.status === "Payé").length;
    const impayes = locs.length - payes;

    const revenus = locs.reduce((sum, l) => 
      sum + (l.rentalForMonth?.status === "Payé" ? Number(l.rentalForMonth.amount || 0) : 0)
    , 0);

    const montantImpayes = locs.reduce((acc, l) => {
      const rent = l.rentalForMonth;
      const homeRent = Number(l.homes?.[0]?.rent || l.loyer || 0);

      if (!rent) return acc + homeRent;
      if (rent.status !== "Payé") return acc + Number(rent.amount || homeRent);

      return acc;
    }, 0);

    const tauxProjet = locs.length ? ((payes / locs.length) * 100).toFixed(1) : 0;
    const loyerMoyenProjet = payes ? (revenus / payes).toFixed(0) : 0;

    return {
      name: p.name,
      locsCount: locs.length,
      payes,
      impayes,
      revenus,
      montantImpayes,
      tauxProjet,
      loyerMoyenProjet
    };
  });
}, [activeProjects, filteredPersons]);


  // 🔹 Chart combiné Bar + Line
  const combinedChartData = {
    labels: projectStats.map(p => p.name),
    datasets: [
      { type: 'bar', label: 'Locataires', data: projectStats.map(p => p.locsCount), backgroundColor: '#3498db' },
      { type: 'bar', label: 'Loyers payés', data: projectStats.map(p => p.payes), backgroundColor: '#2ecc71' },
      { type: 'bar', label: 'Loyers impayés', data: projectStats.map(p => p.impayes), backgroundColor: '#e74c3c' },
      { type: 'line', label: 'Montant payé (FCFA)', data: projectStats.map(p => p.revenus), borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.2)', yAxisID: 'y2', tension: 0.3, fill: false, pointRadius: 5 },
      { type: 'line', label: 'Montant impayé (FCFA)', data: projectStats.map(p => p.montantImpayes), borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.2)', yAxisID: 'y2', tension: 0.3, fill: false, pointRadius: 5 },
      { type: 'line', label: 'Taux paiement (%)', data: projectStats.map(p => p.tauxProjet), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)', yAxisID: 'y1', tension: 0.3, fill: false, pointRadius: 5 },
    ],
  };

  const combinedChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const p = projectStats[context.dataIndex];
            switch(context.dataset.label) {
              case 'Locataires': return `Locataires: ${p.locsCount}`;
              case 'Loyers payés': return `Payés: ${p.payes}`;
              case 'Loyers impayés': return `Impayés: ${p.impayes}`;
              case 'Montant payé (FCFA)': return `Payé: ${p.revenus.toLocaleString()} FCFA`;
              case 'Montant impayé (FCFA)': return `Impayé: ${p.montantImpayes.toLocaleString()} FCFA`;
              case 'Taux paiement (%)': return `Taux: ${p.tauxProjet}%`;
              default: return context.formattedValue;
            }
          }
        }
      }
    },
    scales: {
      y: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Nombre de locataires' } },
      y1: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'Taux paiement (%)' }, grid: { drawOnChartArea: false } },
      y2: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'Montant (FCFA)' }, grid: { drawOnChartArea: false }, offset: true },
    },
  };

  // 🔥 Répartition par genre (H/F)
const genreStats = useMemo(() => {
  const hommes = filteredPersons.filter(p => p.sexe === "M").length;
  const femmes = filteredPersons.filter(p => p.sexe === "F").length;
  return { hommes, femmes };
}, [filteredPersons]);

// 🎯 Doughnut chart data pour sexe (H/F)
const genreChartData = {
  labels: ["Hommes", "Femmes"],
  datasets: [
    {
      data: [genreStats.hommes, genreStats.femmes],
      backgroundColor: ["#3b82f6", "#ec4899"], // bleu / rose
      borderWidth: 1,
    },
  ],
};

const genreChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
  },
};

// 🔹 5 derniers paiements
const lastPayments = useMemo(() => {
  // on récupère tous les paiements existants
  const payments = filteredPersons
    .map(p => ({
      name: `${p.name} ${p.lastname}`,
      project: activeProjects.find(pr => String(pr._id) === String(p.projectId))?.name || "N/A",
      status: p.rentalForMonth?.status || "Impayé",
      amount: Number(p.rentalForMonth?.amount || p.loyer || 0),
      date: p.rentalForMonth?.updatedAt || p.rentalForMonth?.date || null
    }))
    .filter(p => p.date) // uniquement ceux avec date
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // tri décroissant
    .slice(0, 5); // les 5 derniers
  return payments;
}, [filteredPersons, projects]);





  // 🔹 Export Excel
  // const exportExcel = () => {
  //   if (!filteredPersons.length) return toast.error("Aucune donnée à exporter !");
  //   const header = [["Rapport Dashboard - Mois : " + searchMonth], [""], ["Nom", "Projet", "Statut", "Montant"]];
  //   const body = filteredPersons.map(p => [
  //     `${p.name} ${p.lastname}`,
  //     projects.find(pr => String(pr._id) === String(p.projectId))?.name || "N/A",
  //     p.rentalForMonth?.status || "Impayé",
  //     p.rentalForMonth?.amount || 0,
  //   ]);
  //   const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body]);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard");
  //   XLSX.writeFile(workbook, `Dashboard_${searchMonth}.xlsx`);
  // };

  return (
    <div>
      <Navbar />
      <div className="saas-container">
        {loading ? (
          <div className="loading"><TailSpin height="80" width="80" color="#4fa94d" /></div>
        ) : (
          <div className="saas-card">
            {/* <nav className="breadcrumb"><ol><li><Link to="/Accueil">Accueil</Link></li><li>Dashboard</li></ol></nav> */}

            <div className="header-actions">
              {/* <h2>🏢 Dashboard Gestion - {new Date(searchMonth + "-01").toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h2> */}
              <h2>🏢 Dashboard Gestion - Statistiques du mois : {currentMonthLabel}</h2>
              {/* <button className={`export-excel ${hasFeature("exportAllowed") ? "enabled" : "disabled"}`} disabled={!hasFeature("exportAllowed")} onClick={exportExcel}>Export Excel</button> */}
            </div>

            {/* KPIs */}
            <div className="dashboard-cards">
              <div className="card card-primary"><div className="card-header">Locataires</div><span>{totalLocataires}</span></div>
              <div className="card card-success"><div className="card-header">Loyers payés</div><span>{totalLoyersPayes}</span></div>
              <div className="card card-danger"><div className="card-header">Loyers impayés</div><span>{totalLoyersImpayesCount}</span></div>
              <div className="card card-warning"><div className="card-header">Montant impayé</div><span>{montantTotalImpayes.toLocaleString("fr-FR")} FCFA</span></div>
             
              <div className="card card-success"><div className="card-header">Montant payé</div><span>{montantTotalPaye.toLocaleString("fr-FR")} FCFA</span></div>
              <div className="card card-secondary"><div className="card-header">Nb projets</div><span>{nbProjetsActifs}</span></div>
              {/* <div className="card card-info"><div className="card-header">Loyer moyen</div><span>{loyerMoyen} FCFA</span></div> */}
              <div className="card card-secondary"><div className="card-header">Pourcentage impayé</div><span>{pourcentageImpayes}%</span></div>
              {/* <div className="card card-info"><div className="card-header">Loyer moyen total</div><span>{loyerMoyenTotal} FCFA</span></div> */}

              {/* Locataires par type */}
              {Object.keys(locsByType).map((type, idx) => (
                <div key={idx} className="card card-primary">
                  <div className="card-header">Locataires ({type})</div>
                  <span>{locsByType[type]}</span>
                </div>
              ))}
            </div>
<div className="charts-wrapper">
  {/* Bar chart principal */}
  <div className="chart-container large-chart">
    <Chart type='bar' data={combinedChartData} options={combinedChartOptions} />
  </div>

  {/* Donut répartition par sexe + Taux paiement global */}
  <div className="chart-container doughnut-chart" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <h4 style={{ textAlign: "center", marginBottom: "1rem", fontWeight: "600" }}>
      Répartition par sexe
    </h4>
    <div style={{ width: "100%", height: "200px" }}>
      <Chart type="doughnut" data={genreChartData} options={genreChartOptions} />
    </div>

    {/* Carte Taux paiement Global */}
    {/* <div style={{ marginTop: "1rem", width: "100%" }}>
      <div className="card card-info" style={{ width: "100%" }}>
        <div className="card-header">Taux paiement Global</div>
        <span>{tauxPaiementGlobal}%</span>
      </div>
    </div> */}
    <div style={{ marginTop: "1rem", width: "100%" }}>
      <div className="card card-info" style={{ width: "100%" }}>
       <div className="card-header">Montant total global</div>
  <span>{montantTotalPayeGlobal.toLocaleString("fr-FR")} FCFA</span>
</div>
    </div>
  </div>
</div>

            {/* Tableau détaillé */}
            <div className="payment-section">
              <h3>Projets & locataires</h3>
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Locataires</th>
                    <th>Loyers payés</th>
                    <th>Loyers impayés</th>
                    <th>Montant payé (FCFA)</th>
                    <th>Montant impayé (FCFA)</th>
                    <th>Taux paiement (%)</th>
                    {/* <th>Loyer moyen (FCFA)</th> */}
                    {/* <th>% Impayé</th> */}
                  </tr>
                </thead>
                <tbody>
                  {projectStats.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.locsCount}</td>
                      <td>{p.payes}</td>
                      <td>{p.impayes}</td>
                      <td>{p.revenus.toLocaleString("fr-FR")}</td>
                      <td style={{ color: "#dc2626" }}>{p.montantImpayes.toLocaleString("fr-FR")}</td>
                      <td>{p.tauxProjet}</td>
                      {/* <td>{p.loyerMoyenProjet}</td> */}
                      {/* <td style={{ color: (p.montantImpayes / (p.revenus + p.montantImpayes) > 0.5) ? "#dc2626" : "#000" }}>
                        {p.impayes ? ((p.montantImpayes / (p.revenus + p.montantImpayes) * 100).toFixed(1)) : 0}%
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <Toaster position="top-right" reverseOrder={false} />

      <style>{`
        .saas-container { padding:2rem; background:#f8fafc; min-height:100vh; }
        .saas-card { background:#fff; border-radius:12px; padding:2rem; box-shadow:0 6px 20px rgba(0,0,0,0.08); }
        .dashboard-cards { display:flex; flex-wrap:wrap; gap:1rem; justify-content:center; margin-bottom:2rem; }
        .card { width:220px; border-radius:8px; padding:1rem; color:#fff; text-align:center; }
        .card-header { margin-bottom:.5rem; font-weight:600; }
        .card-primary { background:#3b82f6; } 
        .card-success { background:#22c55e; } 
        .card-danger { background:#ef4444; } 
        .card-warning { background:#f59e0b; }
        .card-info { background:#06b6d4; } 
        .card-secondary { background:#64748b; }
        .header-actions { display:flex; justify-content:space-between; align-items: center;margin-bottom:1rem; flex-wrap:wrap; }
        .header-actions h2{  align-items: center;font-weight: bold;}
        .loading { display:flex; justify-content:center; align-items:center; height:60vh; }
        .export-excel { padding:.5rem 1rem; border:none; border-radius:6px; cursor:pointer; color:#fff; background:#16a34a; display:flex; align-items:center; gap:.4rem; }
        .export-excel.disabled { background:#a1a1aa; cursor:not-allowed; opacity:.6; }
        .chart-container { background:#fff; padding:1rem; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); margin-bottom:2rem; }
        .payment-section h3 { margin-bottom:1rem; font-weight:600; }
        .payment-table { width:100%; border-collapse:collapse; font-size:14px; }
        .payment-table th, .payment-table td { border:1px solid #e5e7eb; padding:.8rem; text-align:left; }
        .payment-table th { background:#f1f5f9; }
        .charts-wrapper {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.large-chart {
  flex: 3;
}

.doughnut-chart {
  flex: 1;
  min-width: 280px;
}
  .last-payments {
  background: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-top: 1.5rem;
}
  
        
      `}</style>
    </div>
  );
}