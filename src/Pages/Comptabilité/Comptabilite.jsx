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
  const { user } = useUserContext();

  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);
  const [payments, setPayments] = useState([]);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [searchMonth, setSearchMonth] = useState(localStorage.getItem("searchMonth") || currentMonth);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    if (!user?._id) return;
  
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://backend-ged-immo.onrender.com/data/${user._id}`,{
           headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`, // ✅ envoi du token
        },
      })
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

  // --- Récupération des projets ---
  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetch(`https://backend-ged-immo.onrender.com/projects/admin/${user._id}`,{
           headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`, // ✅ envoi du token
        },
      })
      .then((res) => res.json())
      .then((data) => data.success && setProjects(data.projects || []))
      .catch((err) => toast.error("Erreur récupération projets : " + err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // --- Récupération des locataires ---
  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetch(`https://backend-ged-immo.onrender.com/locataire/${user._id}`,{
           headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`, // ✅ envoi du token
        },
      })
      .then((res) => res.json())
      .then((data) => setPersons(data || []))
      .catch((err) => toast.error("Erreur récupération locataires : " + err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // --- Calcul analytique par projet ---
  const projectStats = useMemo(() => {
    const formattedMonth = searchMonth || currentMonth;

    return projects.map((proj) => {
      const locs = persons.filter((p) => {
        const homesArray = Array.isArray(p.homes) ? p.homes : p.homeId ? [p.homeId] : [];
        return homesArray.some((h) => String(h.projectId || h.project) === String(proj._id));
      });

      const totalLocataires = locs.length;

      const locsWithRent = locs.map((p) => {
        const rentalForMonth = p.rentalIds?.find((rent) => {
          if (!rent.month) return false;
          const rentMonth = typeof rent.month === "string"
            ? rent.month.slice(0, 7)
            : new Date(rent.month).toISOString().slice(0, 7);
          return rentMonth === formattedMonth;
        });
        return { ...p, rentalForMonth };
      });

      const loyersPayes = locsWithRent.filter((p) => p.rentalForMonth?.status === "Payé").length;
      const loyersImpayes = totalLocataires - loyersPayes;

      const revenus = locsWithRent.reduce((acc, p) => {
        if (p.rentalForMonth?.status === "Payé") {
          return acc + (p.rentalForMonth.amount || 0);
        }
        return acc;
      }, 0);

      const tauxPaiement = totalLocataires > 0 ? ((loyersPayes / totalLocataires) * 100).toFixed(1) : 0;

      return {
        projectName: proj.name,
        totalLocataires,
        loyersPayes,
        loyersImpayes,
        tauxPaiement,
        revenus,
      };
    }).filter((p) => p.totalLocataires > 0);

  }, [projects, persons, searchMonth, currentMonth]);

  const totalGlobal = projectStats.reduce((acc, p) => acc + p.revenus, 0);
  const totalLocataires = projectStats.reduce((acc, p) => acc + p.totalLocataires, 0);
  const totalPayes = projectStats.reduce((acc, p) => acc + p.loyersPayes, 0);
  const totalImpayes = projectStats.reduce((acc, p) => acc + p.loyersImpayes, 0);
  const avgTauxPaiement = totalLocataires ? ((totalPayes / totalLocataires) * 100).toFixed(1) : 0;

  const totalImpayesRevenus = projectStats.reduce((acc, p) => {
  const impayes = p.loyersImpayes;
  const montantImpayes = p.revenus / p.loyersPayes * impayes || 0; // estimation du montant impayé
  return acc + montantImpayes;
}, 0);

  // --- Données Chart.js ---
  const chartData = {
    labels: projectStats.map((p) => p.projectName),
    datasets: [
      {
        label: "Revenus (FCFA)",
        data: projectStats.map((p) => p.revenus),
        backgroundColor: "#4f46e5",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
  };

  // --- Export Excel ---
  // --- Export Excel ---
  const exportExcel = () => {
    const header = [
      [`Analyse Comptable - Mois : ${searchMonth}`],
      [""],
      ["Projet", "Locataires", "Loyers Payés", "Loyers Impayés", "Taux Paiement (%)", "Revenus (FCFA)", "Revenus Impayés (FCFA)"],
    ];

    const body = projectStats.map((p) => {
      const revenusImpayes = ((p.revenus / p.loyersPayes) * p.loyersImpayes) || 0;
      return [
        p.projectName,
        p.totalLocataires,
        p.loyersPayes,
        p.loyersImpayes,
        p.tauxPaiement,
        p.revenus,
        revenusImpayes,
      ];
    });

    // ✅ Ligne de total général
    const totalRow = [
      "TOTAL GÉNÉRAL",
      "",
      "",
      "",
      "",
      totalGlobal,
      totalImpayesRevenus,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body, [""], totalRow]);

    worksheet["!cols"] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comptabilité");
    const monthLabel = searchMonth.replace("-", "_");
    XLSX.writeFile(workbook, `Analyse_Comptabilite_${monthLabel}.xlsx`);
  };

  // --- Export PDF ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Analyse comptable - Performances des projets", 14, 15);
    doc.autoTable({
      startY: 25,
      head: [["Projet", "Locataires", "Payés", "Impayés", "Taux (%)", "Revenus (FCFA)"]],
      body: projectStats.map((p) => [
        p.projectName,
        p.totalLocataires,
        p.loyersPayes,
        p.loyersImpayes,
        p.tauxPaiement,
        p.revenus.toLocaleString("fr-FR"),
      ]),
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 3 },
    });
    doc.text(`Total général : ${totalGlobal.toLocaleString("fr-FR")} FCFA`, 14, doc.lastAutoTable.finalY + 10);
    doc.save(`Analyse_Comptabilite_${searchMonth}.pdf`);
  };

  // --- Données combinées pour graphique ---
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
                <li><Link to="/Accueil">Accueil</Link></li>
                <li>Comptabilité</li>
              </ol>
            </nav>

            <div className="header-actions">
              <h2><i className="fa-solid fa-chart-column"></i> Analyse par projet</h2>
              <div className="export-buttons">
                <button className="btn-export excel" onClick={exportExcel}>
                  <i className="fa-solid fa-file-excel"></i> Excel
                </button>
                {/* <button className="btn-export pdf" onClick={exportPDF}>
                  <i className="fa-solid fa-file-pdf"></i> PDF
                </button> */}
              </div>
            </div>

            <div className="filter-section">
              <input
                type="month"
                value={searchMonth}
                onChange={(e) => { setSearchMonth(e.target.value); localStorage.setItem("searchMonth", e.target.value); }}
                className="select-field"
              />
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
                  <tr>
                    <th>Projet</th>
                    <th>Locataires</th>
                    <th>Loyers payés</th>
                    <th>Loyers impayés</th>
                    <th>Taux paiement</th>
                    <th>Revenus impayés (FCFA)</th>
                    <th>Revenus (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {projectStats.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>Aucune donnée pour ce mois.</td>
                    </tr>
                  ) : (
                    projectStats.map((p, i) => (
                      <tr key={i}>
                        <td>{p.projectName}</td>
                        <td>{p.totalLocataires}</td>
                        <td style={{ color: "#16a34a", fontWeight: 600 }}>{p.loyersPayes}</td>
                        <td style={{ color: "#dc2626", fontWeight: 600 }}>{p.loyersImpayes}</td>
                        <td>{p.tauxPaiement}%</td>
                        <td style={{ color: "#dc2626" }}>
                        {((p.revenus / p.loyersPayes) * p.loyersImpayes).toLocaleString("fr-FR")}
                      </td>
                        <td>{p.revenus.toLocaleString("fr-FR")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {projectStats.length > 0 && (
                  
                  <tfoot>
                     <tr style={{ fontWeight: "600", background: "#f9fafb" }}>
    <td colSpan="5" style={{ textAlign: "right" }}>Total Général :</td>
  
    <td style={{ color: "#dc2626" }}>{totalImpayesRevenus.toLocaleString("fr-FR")} FCFA</td>
      <td>{totalGlobal.toLocaleString("fr-FR")} FCFA</td>
  </tr>
  
                    {/* <tr style={{ fontWeight: "600", background: "#f9fafb" }}>
                      <td colSpan="5" style={{ textAlign: "right" }}>Total général :</td>
                      <td>{totalGlobal.toLocaleString("fr-FR")} FCFA</td>
                    </tr> */}
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
      `}</style>
    </div>
  );
}