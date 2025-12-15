import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import React, { useState, useEffect, useMemo } from "react";
import { TailSpin } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "../../contexts/UserContext";
import * as XLSX from "xlsx";
import { Chart } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function isProjectActiveDuringPeriod(project, periodStart, periodEnd) {
  return project.periods?.some(p => {
    const start = new Date(p.start);
    const end = p.end ? new Date(p.end) : new Date(9999, 11, 31);
    return start <= periodEnd && end >= periodStart;
  });
}

export default function Comptabilite() {
  const { user, hasFeature ,getAuthHeaders } = useUserContext();
  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [searchMonth, setSearchMonth] = useState(localStorage.getItem("searchMonth") || currentMonth);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(localStorage.getItem("selectedType") || "");
  const [projectTypes, setProjectTypes] = useState([]);
  const [reportMode, setReportMode] = useState("monthly"); // monthly | yearly
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const currentYear = new Date().getFullYear();
const [openProjectDetails, setOpenProjectDetails] = useState(null);

const isArchivedProject = (project) => {
  return project.archived === true;
};


  // --- Sauvegarde localStorage ---
  useEffect(() => { localStorage.setItem("searchMonth", searchMonth); }, [searchMonth]);
  useEffect(() => { localStorage.setItem("selectedType", selectedType); }, [selectedType]);

  // --- Récupération données admin/user ---
  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);

    const fetchAllData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/data/${user._id}`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!data.success) {
          toast.error(data.message || "Erreur lors du chargement des données");
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

    fetchAllData();
  }, [user]);

  // --- Déterminer les types de projet ---
  useEffect(() => {
    if (projects.length > 0) {
      const types = [...new Set(projects.map(p => p.categorie || p.type || "autre"))];
      setProjectTypes(types);
    }
  }, [projects]);

  // --- Filtrage projets par mois et type ---
  const filteredProjects = useMemo(() => {
    const [year, month] = (searchMonth || currentMonth).split("-");
    const monthStart = new Date(Number(year), Number(month) - 1, 1);
    const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    return projects.filter(proj => {
      const isActiveDuringMonth = proj.periods?.some(p => {
        const start = new Date(p.start);
        const end = p.end ? new Date(p.end) : new Date(9999, 11, 31);
        return start <= monthEnd && end >= monthStart;
      });
      if (!isActiveDuringMonth) return false;

      const matchesType = !selectedType || (proj.categorie || proj.type || "autre").toLowerCase() === selectedType.toLowerCase();
      return matchesType;
    });
  }, [projects, selectedType, searchMonth, currentMonth]);

  // --- Fonction pour récupérer le loyer d’un locataire ---
  function getMontantLoyer(p) {
    if (p.rentalForMonth?.amount !== undefined) return Number(p.rentalForMonth.amount);
    if (p.homes?.length && p.homes[0].rent) return Number(p.homes[0].rent);
    if (p.loyer) return Number(p.loyer);
    return 0;
  }

  // --- Calcul analytique par projet ---
  const projectStats = useMemo(() => {
    if (!filteredProjects.length) return [];

    const formattedMonth = searchMonth || currentMonth;
    const [year, month] = formattedMonth.split("-");
    const monthStart = new Date(Number(year), Number(month) - 1, 1);
    const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    return filteredProjects.map(proj => {
      const locsDuProjet = persons.filter(p => p.projectId && String(p.projectId) === String(proj._id));

      // 🔹 Locataires actifs pendant le mois
      const locsActifs = locsDuProjet.filter(p => {
        let start = p.periodStart ? new Date(p.periodStart) : p.date_entrance ? new Date(p.date_entrance) : new Date(0);
        let end =
          p.periodEnd ? new Date(p.periodEnd) :
          p.dateArchived ? new Date(p.dateArchived) :
          p.release_date ? new Date(p.release_date) :
          (p.archived ? (p.updatedAt ? new Date(p.updatedAt) : new Date()) : null);
        if (!end) end = new Date(9999, 11, 31, 23, 59, 59, 999);
        return start <= monthEnd && end >= monthStart;
      });

      const totalLocataires = locsActifs.length;

      const locsWithRent = locsActifs.map(p => {
        const rentalForMonth = (p.rentalIds || []).find(r => {
          if (!r?.month) return false;
          const rentMonth = typeof r.month === "string" ? r.month.slice(0, 7) : new Date(r.month).toISOString().slice(0, 7);
          return rentMonth === formattedMonth;
        });
        return { ...p, rentalForMonth };
      });

      const loyersPayes = locsWithRent.filter(p => p.rentalForMonth?.status === "Payé").length;
      const loyersImpayes = totalLocataires - loyersPayes;

      const revenus = locsWithRent.reduce((acc, p) => acc + (p.rentalForMonth?.status === "Payé" ? Number(p.rentalForMonth.amount) || 0 : 0), 0);

      const revenusImpayes = locsWithRent.reduce((acc, p) => {
        if (p.rentalForMonth?.status === "Payé") return acc;
        return acc + getMontantLoyer(p);
      }, 0);

      const tauxPaiement = totalLocataires > 0 ? ((loyersPayes / totalLocataires) * 100).toFixed(1) : 0;

      return {
        projectName: proj.name,
        totalLocataires,
        loyersPayes,
        loyersImpayes,
        tauxPaiement,
        revenus,
        revenusImpayes
      };
    });
  }, [filteredProjects, persons, searchMonth, currentMonth]);

  const totalGlobal = projectStats.reduce((acc, p) => acc + p.revenus, 0);
  const totalLocataires = projectStats.reduce((acc, p) => acc + p.totalLocataires, 0);
  const totalPayes = projectStats.reduce((acc, p) => acc + p.loyersPayes, 0);
  const totalImpayes = projectStats.reduce((acc, p) => acc + p.loyersImpayes, 0);
  const avgTauxPaiement = totalLocataires ? ((totalPayes / totalLocataires) * 100).toFixed(1) : 0;
  const totalImpayesRevenus = projectStats.reduce((acc, p) => acc + p.revenusImpayes, 0);

  // --- Chart.js ---
  const combinedChartData = {
    labels: projectStats.map(p => p.projectName),
    datasets: [
      { type: 'bar', label: 'Total locataires', data: projectStats.map(p => p.totalLocataires), backgroundColor: '#3498db' },
      { type: 'bar', label: 'Loyers payés', data: projectStats.map(p => p.loyersPayes), backgroundColor: '#2ecc71' },
      { type: 'bar', label: 'Loyers impayés', data: projectStats.map(p => p.loyersImpayes), backgroundColor: '#e74c3c' },
      { type: 'line', label: 'Taux paiement (%)', data: projectStats.map(p => p.tauxPaiement), borderColor: '#f1c40f', yAxisID: 'y1', tension: 0.3, fill: false, pointRadius: 5 },
      { type: 'line', label: 'Revenus (FCFA)', data: projectStats.map(p => p.revenus), borderColor: '#8e44ad', yAxisID: 'y2', tension: 0.3, fill: false, pointRadius: 5 },
      { type: 'line', label: 'Montant impayé (FCFA)', data: projectStats.map(p => p.revenusImpayes), borderColor: '#dc2626', yAxisID: 'y2', tension: 0.3, fill: false, pointRadius: 5 },
    ],
  };

  const combinedChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Nombre de locataires' } },
      y1: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'Taux de paiement (%)' }, grid: { drawOnChartArea: false } },
      y2: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'Montant (FCFA)' }, grid: { drawOnChartArea: false }, offset: true },
    },
  };

  // --- Export Excel ---
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
      p.revenusImpayes
    ]);
    const totalRow = ["TOTAL GÉNÉRAL", "", "", "", "", totalGlobal, totalImpayesRevenus];
    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body, [""], totalRow]);
    worksheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 22 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comptabilité");
    XLSX.writeFile(workbook, `Analyse_Comptabilite_${searchMonth.replace("-", "_")}.xlsx`);
  };
const annualProjectStats = useMemo(() => {
  if (reportMode !== "yearly") return [];

  const year = Number(selectedYear);

  const months = Array.from({ length: 12 }, (_, i) => ({
    start: new Date(year, i, 1),
    end: new Date(year, i + 1, 0, 23, 59, 59, 999),
    key: `${year}-${String(i + 1).padStart(2, "0")}`
  }));

  return projects.map(project => {
    let loyersAttendus = 0;
    let loyersEncaisses = 0;
    let loyersImpayes = 0;
    let moisLouesSet = new Set();

    const locataires = persons.filter(
      p => String(p.projectId) === String(project._id)
    );

    locataires.forEach(p => {
      months.forEach(month => {
        const start = p.periodStart
          ? new Date(p.periodStart)
          : p.date_entrance
          ? new Date(p.date_entrance)
          : new Date(0);

        const end = p.periodEnd
          ? new Date(p.periodEnd)
          : p.dateArchived
          ? new Date(p.dateArchived)
          : p.release_date
          ? new Date(p.release_date)
          : new Date(9999, 11, 31);

        // ✅ locataire actif ce mois
        if (!(start <= month.end && end >= month.start)) return;

        moisLouesSet.add(month.key);

        const loyer = getMontantLoyer(p);
        loyersAttendus += loyer;

        const rent = (p.rentalIds || []).find(r => {
          if (!r.month) return false;
          const m =
            typeof r.month === "string"
              ? r.month.slice(0, 7)
              : new Date(r.month).toISOString().slice(0, 7);
          return m === month.key;
        });

        if (rent?.status === "Payé") {
          loyersEncaisses += Number(rent.amount || loyer);
        } else {
          loyersImpayes += loyer;
        }
      });
    });

    const tauxRecouvrement =
      loyersAttendus > 0
        ? ((loyersEncaisses / loyersAttendus) * 100).toFixed(1)
        : "0.0";

    return {
      projectId: project._id,
      projectName: project.name,
      moisLoues: moisLouesSet.size,
      loyersAttendus,
      loyersEncaisses,
      loyersImpayes,
      tauxRecouvrement,
      statut: moisLouesSet.size === 0 ? "Inactif" : "Actif"
    };
  });
}, [reportMode, selectedYear, projects, persons]);

  const bilanProprietaire = useMemo(() => {
  if (reportMode === "yearly") return annualProjectStats;

  return projectStats.map(p => ({
    projectName: p.projectName,
    revenus: p.revenus,
    revenusImpayes: p.revenusImpayes
  }));
}, [reportMode, annualProjectStats, projectStats]);

// const exportAnnualExcel = () => {
//   if (!annualProjectStats.length) {
//     toast.error("Aucune donnée annuelle disponible");
//     return;
//   }

//   const header = [
//     [`Rapport Annuel - ${selectedYear}`],
//     [""],
//     [
//       "Projet",
//       "Mois loués",
//       "Loyers attendus (FCFA)",
//       "Loyers encaissés (FCFA)",
//       "Loyers impayés (FCFA)",
//       "Taux de recouvrement (%)"
//     ]
//   ];

//   const body = annualProjectStats.map(p => [
//     p.projectName,
//     p.moisLoues,
//     p.loyersAttendus,
//     p.loyersPayes,
//     p.loyersImpayes,
//     p.tauxRecouvrement
//   ]);

//   const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body]);
//   worksheet["!cols"] = [
//     { wch: 25 },
//     { wch: 12 },
//     { wch: 22 },
//     { wch: 25 },
//     { wch: 25 },
//     { wch: 20 }
//   ];

//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport Annuel");

//   XLSX.writeFile(workbook, `Rapport_Annuel_${selectedYear}.xlsx`);
// };

const exportAnnualExcel = () => {
  if (!annualProjectStats.length) {
    toast.error("Aucune donnée annuelle disponible");
    return;
  }

  const workbook = XLSX.utils.book_new();

  annualProjectStats.forEach(project => {
    const tenants = getAnnualTenantDetails(project.projectId);

    // Header du projet
   const header = [
  [`Projet : ${project.projectName} - Année : ${selectedYear}`],
  [""],
  [
    "Locataire",
    "Période",
    "Mois loués",
    "Nb mois",
    "Loyers attendus (FCFA)",
    "Loyers encaissés (FCFA)",
    "Loyers impayés (FCFA)",
    "Statut"
  ]
];

   const body = tenants.map(t => [
  t.nom,
  t.periode,
  t.moisLoues.join(", "),
  t.moisLoues.length,
  t.attendu,
  t.paye,
  t.impaye,
  t.statut
]);

    // Totaux projet
    const totalRow = [
  "TOTAL PROJET",
  "",
  "",
  "",
  tenants.reduce((acc, t) => acc + t.attendu, 0),
  tenants.reduce((acc, t) => acc + t.paye, 0),
  tenants.reduce((acc, t) => acc + t.impaye, 0),
  ""
];

    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body, [""], totalRow]);
    worksheet["!cols"] = [
  { wch: 22 }, // Locataire
  { wch: 25 }, // Période
  { wch: 35 }, // Mois loués
  { wch: 10 }, // Nb mois
  { wch: 20 }, // Attendu
  { wch: 22 }, // Payé
  { wch: 22 }, // Impayé
  { wch: 14 }  // Statut
];

    XLSX.utils.book_append_sheet(workbook, worksheet, project.projectName.slice(0, 31));
  });

  XLSX.writeFile(workbook, `Rapport_Annuel_Detail_${selectedYear}.xlsx`);
  toast.success("Export Excel avec détails locataires généré !");
};
const formatFCFA = (value) =>
  Number(value || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    + " FCFA";
// const exportAnnualPDF = () => {
//   if (!annualProjectStats.length) {
//     toast.error("Aucune donnée annuelle disponible");
//     return;
//   }

//   annualProjectStats.forEach(project => {
//     const doc = new jsPDF("landscape", "mm", "a4");
//     const tenants = getAnnualTenantDetails(project.projectId);

//     /* =========================
//        HEADER
//     ========================== */
//     doc.setFillColor(37, 99, 235);
//     doc.rect(0, 0, 297, 22, "F");

//     doc.setTextColor(255);
//     doc.setFontSize(16);
//     doc.text("GED IMMO — Rapport Annuel", 14, 14);

//     doc.setFontSize(10);
//     doc.text(`Année : ${selectedYear}`, 250, 14);

//     doc.setTextColor(0);

//     /* =========================
//        INFOS PROJET
//     ========================== */
//     doc.setFontSize(13);
//     doc.text(`Projet : ${project.projectName}`, 14, 32);

//     doc.setFontSize(10);
//     doc.text(`Statut : ${project.statut}`, 14, 38);
//     doc.text(`Mois loués : ${project.moisLoues}`, 70, 38);
//     doc.text(
//       `Taux recouvrement : ${project.tauxRecouvrement}%`,
//       140,
//       38
//     );

//     doc.setDrawColor(229, 231, 235);
//     doc.line(14, 42, 280, 42);

//     /* =========================
//        TABLE LOCATAIRES
//     ========================== */
//     autoTable(doc, {
//       startY: 46,
//       head: [[
//         "Locataire",
//         "Période",
//         "Mois loués",
//         "Nb",
//         "Attendu",
//         "Payé",
//         "Impayé",
//         "Statut"
//       ]],
//       body: tenants.map(t => [
//         t.nom,
//         t.periode,
//         t.moisLoues.join(", "),
//         t.moisLoues.length,
//         formatFCFA(t.attendu),
//         formatFCFA(t.paye),
//         formatFCFA(t.impaye),
//         t.statut
//       ]),
//       theme: "striped",
//       styles: {
//         fontSize: 9,
//         cellPadding: 3,
//         overflow: "linebreak"
//       },
//       headStyles: {
//         fillColor: [243, 244, 246],
//         textColor: 17,
//         fontStyle: "bold"
//       },
//       columnStyles: {
//         0: { cellWidth: 32 },
//         1: { cellWidth: 36 },
//         2: { cellWidth: 72 },
//         3: { cellWidth: 10 },
//         4: { cellWidth: 28 },
//         5: { cellWidth: 28 },
//         6: { cellWidth: 28 },
//         7: { cellWidth: 15 }
//       }
//     });

//     /* =========================
//        TOTAL PROJET
//     ========================== */
//     const totalAttendu = tenants.reduce((a, t) => a + t.attendu, 0);
//     const totalPaye = tenants.reduce((a, t) => a + t.paye, 0);
//     const totalImpaye = tenants.reduce((a, t) => a + t.impaye, 0);

//     autoTable(doc, {
//       startY: doc.lastAutoTable.finalY + 2,
//       body: [[
//         "TOTAL PROJET",
//         "",
//         "",
//         "",
//         formatFCFA(totalAttendu),
//         formatFCFA(totalPaye),
//         formatFCFA(totalImpaye),
//         ""
//       ]],
//       styles: {
//         fontSize: 10,
//         fontStyle: "bold",
//         fillColor: [240, 249, 255]
//       }
//     });

//     /* =========================
//        FOOTER
//     ========================== */
//     const pageCount = doc.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(9);
//       doc.setTextColor(120);
//       doc.text(
//         `GED IMMO • Document confidentiel • Page ${i}/${pageCount}`,
//         148,
//         200,
//         { align: "center" }
//       );
//     }

//     /* =========================
//        SAVE
//     ========================== */
//     doc.save(
//       `Rapport_Annuel_${selectedYear}_${project.projectName}.pdf`
//     );
//   });

//   toast.success("PDF annuel généré avec succès !");
// };




const getAnnualTenantDetails = (projectId) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(selectedYear, i, 1);
    return {
      key: `${selectedYear}-${String(i + 1).padStart(2, "0")}`,
      start: new Date(selectedYear, i, 1),
      end: new Date(selectedYear, i + 1, 0, 23, 59, 59, 999),
      label: date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric"
      })
    };
  });

  return persons
    .filter(p => String(p.projectId) === String(projectId))
    .map(p => {
      let attendu = 0;
      let paye = 0;
      let moisLoues = [];

      const loyer = getMontantLoyer(p);

      months.forEach(month => {
        const start = p.periodStart
          ? new Date(p.periodStart)
          : p.date_entrance
          ? new Date(p.date_entrance)
          : null;

        const end = p.periodEnd
          ? new Date(p.periodEnd)
          : p.dateArchived
          ? new Date(p.dateArchived)
          : p.release_date
          ? new Date(p.release_date)
          : null;

        if (!start || start > month.end) return;
        if (end && end < month.start) return;

        attendu += loyer;
        moisLoues.push(month.label);

        const rent = (p.rentalIds || []).find(r => {
          if (!r.month) return false;
          const m =
            typeof r.month === "string"
              ? r.month.slice(0, 7)
              : new Date(r.month).toISOString().slice(0, 7);
          return m === month.key;
        });

        if (rent?.status === "Payé") {
          paye += Number(rent.amount || loyer);
        }
      });

      const impaye = attendu - paye;

      const fullName =
        p.typePersonne === "societe"
          ? p.raisonSociale
          : [
              (p.lastname || "").toUpperCase(),
              p.name || ""
            ].filter(Boolean).join(" ");

      return {
        nom: fullName || "Inconnu",
        periode: String(selectedYear),          // ✅ 2025
        moisLoues,                              // ✅ tableau clair
        nb: moisLoues.length,                   // ✅ nombre réel
        attendu,
        paye,
        impaye,
        statut: paye >= attendu ? "Payé" : "Impayé"
      };
    });
};

const formatMonthYearFR = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  return new Date(year, month - 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric"
  });
};
const getFormattedDateFR = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

const exportPDF = (options = { oneFilePerProject: true }) => {
  if (!projects.length || !persons.length) {
    toast.error("Aucune donnée disponible pour l'export PDF !");
    return;
  }

  // 🔹 Projets filtrés selon le mode et le type (exactement comme Excel)
  const projectsForExport = reportMode === "monthly"
    ? filteredProjects
    : projects.filter(p => !selectedType || (p.categorie || p.type || "autre").toLowerCase() === selectedType.toLowerCase());

  if (!projectsForExport.length) {
    toast.error("Aucun projet ne correspond aux filtres pour l'export PDF !");
    return;
  }

  // 🔹 Créer un PDF unique si demandé
  const combinedDoc = options.oneFilePerProject ? null : new jsPDF("landscape", "mm", "a4");

  const generateProjectPDF = (proj, doc, startY = 46) => {
    // Récupération locataires comme Excel
    let tenants = [];
    if (reportMode === "monthly") {
      const [year, month] = (searchMonth || currentMonth).split("-");
      const monthStart = new Date(Number(year), Number(month) - 1, 1);
      const monthEnd = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

      tenants = persons
        .filter(p => String(p.projectId) === String(proj._id))
        .filter(p => {
          const start = p.periodStart ? new Date(p.periodStart) : p.date_entrance ? new Date(p.date_entrance) : new Date(0);
          const end = p.periodEnd ? new Date(p.periodEnd) :
                      p.dateArchived ? new Date(p.dateArchived) :
                      p.release_date ? new Date(p.release_date) :
                      new Date(9999, 11, 31);
          return start <= monthEnd && end >= monthStart;
        })
        .map(p => {
  const loyer = getMontantLoyer(p);

  const rent = (p.rentalIds || []).find(r => {
    if (!r.month) return false;
    const m =
      typeof r.month === "string"
        ? r.month.slice(0, 7)
        : new Date(r.month).toISOString().slice(0, 7);
    return m === searchMonth;
  });

  // ✅ NOM COMPLET (particulier / société)
 const fullName =
  p.typePersonne === "societe"
    ? p.raisonSociale
    : [
        (p.lastname || p.nom || "").toUpperCase(),
        p.firstName || p.prenom || p.name || ""
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

  return {
    nom: fullName || "Inconnu",
    attendu: loyer,
    paye: rent?.status === "Payé" ? Number(rent.amount || loyer) : 0,
    impaye: rent?.status !== "Payé" ? loyer : 0,

    // ✅ FORMAT HUMAIN
    moisLoues: [formatMonthYearFR(searchMonth)],
    periode: formatMonthYearFR(searchMonth),

    statut: rent?.status === "Payé" ? "Payé" : "Impayé"
  };
});
    } else {
      tenants = getAnnualTenantDetails(proj._id);
    }

    // =========================
    // HEADER
    // =========================
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 297, 22, "F");
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text("GED IMMO — Rapport", 14, 14);
    doc.setFontSize(10);
    doc.text(reportMode === "monthly" ? `Mois : ${searchMonth}` : `Année : ${selectedYear}`, 250, 14);
    doc.setTextColor(0);

    // =========================
    // INFOS PROJET
    // =========================
    doc.setFontSize(13);
    doc.text(`Projet : ${proj.name || proj.projectName}`, 14, 32);

    doc.setFontSize(10);

   const totalLocataires = tenants.length;

const totalAttenduCalc = tenants.reduce((a, t) => a + (t.attendu || 0), 0);
const totalPayeCalc = tenants.reduce((a, t) => a + (t.paye || 0), 0);

const taux =
  totalAttenduCalc > 0
    ? (totalPayeCalc / totalAttenduCalc) * 100
    : 0;
    doc.text(
      reportMode === "monthly"
        ? `Total locataires : ${totalLocataires}`
        : `Mois loués : ${totalLocataires}`,
      70,
      38
    );
    doc.text(
      reportMode === "monthly"
        ? `Taux paiement : ${taux.toFixed ? taux.toFixed(1) : taux}%`
        : `Taux recouvrement : ${taux}%`,
      140,
      38
    );

    doc.setDrawColor(229, 231, 235);
    doc.line(14, 42, 280, 42);

    // =========================
    // TABLE LOCATAIRES
    // =========================
   if (tenants.length > 0) {
  // Ligne totaux
  const totalAttendu = tenants.reduce((a, t) => a + t.attendu, 0);
  const totalPaye = tenants.reduce((a, t) => a + t.paye, 0);
  const totalImpaye = tenants.reduce((a, t) => a + t.impaye, 0);

  const cleanPeriode = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/\n+/g, " ")   // supprime les retours à la ligne
    .replace(/\s+/g, " ")   // supprime les doubles espaces
    .trim();
};

 const tableBody = tenants.map(t => [
  t.nom,
  reportMode === "monthly"
    ? t.periode
    : t.periode, // année seulement

  reportMode === "monthly"
    ? t.moisLoues[0]
    : t.moisLoues.join(", "),

  reportMode === "monthly"
    ? 1
    : t.nb,

  formatFCFA(t.attendu),
  formatFCFA(t.paye),
  formatFCFA(t.impaye),
  t.statut
]);

  // Ajouter la ligne totale à la fin du tableau
  tableBody.push([
    "TOTAL PROJET",
    "",
    "",
    "",
    formatFCFA(totalAttendu),
    formatFCFA(totalPaye),
    formatFCFA(totalImpaye),
    ""
  ]);

  autoTable(doc, {
  startY,
  head: [["Locataire","Période","Mois loués","Nb","Attendu","Payé","Impayé","Statut"]],
  body: tableBody,
  theme: "striped",
  tableWidth: "auto",       // permet de remplir toute la largeur
  margin: { left: 10, right: 10 },
  styles: {
    fontSize: 9,
    cellPadding: 3,
    overflow: "visible",    // ✅ empêche le wrap
    whiteSpace: "nowrap",   // ✅ FCFA sur UNE ligne
    valign: "middle",
    halign: "center"
  },
  headStyles: {
    fillColor: [243,244,246],
    textColor: 17,
    fontStyle: "bold",
    halign: "center"
  },
  footStyles: {
    fillColor: [240,249,255],
    fontStyle: "bold",
    halign: "center"
  },
  columnStyles: {
    0: { cellWidth: 50, halign: "left" },   // Locataire
    1: { cellWidth: 40 },                    // Période
    2: { cellWidth: 40 },                    // Mois loués
    3: { cellWidth: 15 },                    // Nb
    4: { cellWidth: 35, halign: "right" },  // Attendu
    5: { cellWidth: 35, halign: "right" },  // Payé
    6: { cellWidth: 35, halign: "right" },  // Impayé
    7: { cellWidth: 25 }                     // Statut
  },
  showFoot: "lastRow"
});
} else {
  doc.setFontSize(11);
  doc.text("Aucun locataire pour ce projet.", 14, 50);
}


    // Footer
  // =========================
// FOOTER avec date officielle
// =========================
const pageCount = doc.getNumberOfPages();
const formattedDate = getFormattedDateFR();

for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);

  // Ligne gauche : lieu + date
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Fait à Abidjan, le ${formattedDate}`,
    14,
    200
  );

  // Ligne centre : confidentialité
  doc.text(
    "GED IMMO • Document confidentiel",
    148,
    200,
    { align: "center" }
  );

  // Ligne droite : pagination
  doc.text(
    `Page ${i}/${pageCount}`,
    280,
    200,
    { align: "right" }
  );
}

    return doc;
  };

  // =========================
  // Génération PDF
  // =========================
  if (options.oneFilePerProject) {
    // PDF séparé par projet
    projectsForExport.forEach(proj => {
      const doc = generateProjectPDF(proj, new jsPDF("landscape", "mm", "a4"));
      doc.save(`Rapport_${reportMode === "monthly" ? searchMonth : selectedYear}_${proj.name || proj.projectName}.pdf`);
    });
  } else {
    // PDF unique combiné
    let doc = combinedDoc;
    let startY = 46;
    projectsForExport.forEach((proj, idx) => {
      if (idx > 0) doc.addPage();
      doc = generateProjectPDF(proj, doc, startY);
    });
    doc.save(`Rapport_${reportMode === "monthly" ? searchMonth : selectedYear}_Tous_Projets.pdf`);
  }

  toast.success(`PDF ${reportMode === "monthly" ? "mensuel" : "annuel"} généré avec succès !`);
};


const compareYearly = useMemo(() => {
  const yearN = selectedYear;
  const yearN1 = selectedYear - 1;

  const calcRevenus = (year) => {
    return projects.map(proj => {
      const locs = persons.filter(p => String(p.projectId) === String(proj._id));

      let revenus = 0;
      locs.forEach(p => {
        (p.rentalIds || []).forEach(r => {
          const month = typeof r.month === "string" ? r.month.slice(0, 4) : new Date(r.month).getFullYear();
          if (Number(month) === year && r.status === "Payé") revenus += Number(r.amount || getMontantLoyer(p));
        });
      });

      return { projectId: proj._id, projectName: proj.name, revenus };
    });
  };

  const revenusN = calcRevenus(yearN);
  const revenusN1 = calcRevenus(yearN1);

  // Combiner par projet
  return projects.map(proj => {
    const n = revenusN.find(r => r.projectId === proj._id)?.revenus || 0;
    const n1 = revenusN1.find(r => r.projectId === proj._id)?.revenus || 0;
    const diff = n - n1;
    const pct = n1 > 0 ? ((diff / n1) * 100).toFixed(1) : "100.0";
    return {
      projectId: proj._id,
      projectName: proj.name,
      revenusN: n,
      revenusN1: n1,
      diff,
      pct
    };
  });
}, [projects, persons, selectedYear]);

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
    {/* 🔹 Sélecteur type de rapport */}
    <select
      className="select-field"
      value={reportMode}
      onChange={e => setReportMode(e.target.value)}>
      <option value="monthly">📅 Rapport mensuel</option>
      <option value="yearly">📊 Rapport annuel</option>
    </select>

{reportMode === "yearly" && (
  <select
    className="select-field"
    value={selectedYear}
    onChange={e => setSelectedYear(Number(e.target.value))}
  >
    {Array.from({ length: currentYear - 2021 }, (_, i) => {
      const year = 2022 + i;
      return (
        <option key={year} value={year}>
          {year}
        </option>
      );
    })}
  </select>
)}

    {/* 🔹 Bouton export intelligent */}
    <button
      className={`export-excel ${hasFeature("exportAllowed") ? "enabled" : "disabled"}`}
      disabled={!hasFeature("exportAllowed")}
      onClick={reportMode === "monthly" ? exportExcel : exportAnnualExcel}
    >
      <i className="fa-solid fa-file-excel"></i>
      {reportMode === "monthly" ? "Export Mensuel" : "Export Annuel"}
    </button>
    <button
  className="export-pdf enabled"
  onClick={exportPDF}>
  <i className="fa-solid fa-file-pdf"></i>
  Export PDF
</button>
  </div>
</div>

            <div className="filter-section">
               {/* <div className="archive-toggle">
                    <span className="toggle-label">Afficher projets archivés</span>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={() => setShowArchived(!showArchived)}
                      />
                      <span className="slider" />
                    </label>
                  </div> */}
              <select className="select-field" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
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
              <div className="indicator">❌ Montant impayé : {totalImpayesRevenus.toLocaleString("fr-FR")} FCFA</div>
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
                    <th>Projet</th><th>Locataires</th><th>Loyers payés</th><th>Loyers impayés</th><th>Taux paiement</th><th>Revenus impayés (FCFA)</th><th>Revenus (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {projectStats.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center" }}>Aucune donnée pour ce mois.</td></tr>
                  ) : projectStats.map((p, i) => (
                    <tr key={i}>
                      <td>
                        {p.projectName}

                        {projects.find(pr => pr.name === p.projectName)?.archived && (
                          <span className="badge badge-archived">Archivé</span>
                        )}
                      </td>
                      <td>{p.totalLocataires}</td>
                      <td style={{ color: "#16a34a", fontWeight: 600 }}>{p.loyersPayes}</td>
                      <td style={{ color: "#dc2626", fontWeight: 600 }}>{p.loyersImpayes}</td>
                      <td>{p.tauxPaiement}%</td>
                      <td style={{ color: "#dc2626" }}>{p.revenusImpayes.toLocaleString("fr-FR")}</td>
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

            {reportMode === "yearly" && (
  <div className="payment-section">
    <h3>📊 Rapport annuel par projet – {selectedYear}</h3>

    <table className="payment-table">
      <thead>
        <tr>
          <th>Projet</th>
          <th>Mois loués</th>
          <th>Loyers attendus</th>
          <th>Loyers encaissés</th>
          <th>Loyers impayés</th>
          <th>Taux recouvrement</th>
        </tr>
      </thead>

     <tbody>
  {annualProjectStats.map((p) => (
    <React.Fragment key={p.projectId}>
      {/* 🔹 Ligne projet */}
      <tr>
        <td>
            {p.projectName}

            {projects.find(pr => String(pr._id) === String(p.projectId))?.archived && (
              <span className="badge badge-archived">Archivé</span>
            )}

            {p.statut === "Inactif" && (
              <span className="badge badge-gray">Inactif</span>
            )}

            <button
              style={{ marginLeft: 8, fontSize: 12 }}
              onClick={() =>
                setOpenProjectDetails(
                  openProjectDetails === p.projectId ? null : p.projectId
                )
              }
            >
              {openProjectDetails === p.projectId ? "Masquer" : "Détails"}
            </button>
          </td>
        <td>{p.moisLoues}</td>
        <td>{p.loyersAttendus.toLocaleString("fr-FR")} FCFA</td>
        <td style={{ color: "#16a34a", fontWeight: 600 }}>
          {p.loyersEncaisses.toLocaleString("fr-FR")} FCFA
        </td>
        <td style={{ color: "#dc2626", fontWeight: 600 }}>
          {p.loyersImpayes.toLocaleString("fr-FR")} FCFA
        </td>
        <td>{p.tauxRecouvrement}%</td>
      </tr>

      {/* 🔹 Détails locataires */}
      {openProjectDetails === p.projectId && (
        <tr>
          <td colSpan="6">
            <table className="payment-table" style={{ background: "#f9fafb" }}>
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Loyers attendus</th>
                  <th>Loyers encaissés</th>
                  <th>Loyers impayés</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {getAnnualTenantDetails(p.projectId).map((t) => (
                  <tr key={t.nom}>
                    <td>{t.nom} {t.prenom}</td>
                    <td>{t.attendu.toLocaleString("fr-FR")} FCFA</td>
                    <td style={{ color: "#16a34a" }}>{t.paye.toLocaleString("fr-FR")} FCFA</td>
                    <td style={{ color: "#dc2626" }}>{t.impaye.toLocaleString("fr-FR")} FCFA</td>
                    <td>
                      <span className={`badge ${t.statut === "Payé" ? "badge-blue" : "badge-gray"}`}>
                        {t.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>
    </table>
  </div>
              )}

{/* <div className="payment-section">
  <h3>Comparaison {selectedYear - 1} / {selectedYear}</h3>
  <table className="payment-table">
    <thead>
      <tr>
        <th>Projet</th>
        <th>Revenus {selectedYear - 1}</th>
        <th>Revenus {selectedYear}</th>
        <th>Différence</th>
        <th>% variation</th>
      </tr>
    </thead>
    <tbody>
      {compareYearly.map(p => {
        const isArchived = projects.find(pr => String(pr._id) === String(p.projectId))?.archived;
        return (
          <tr key={p.projectId}>
            <td>
              {p.projectName}
              {isArchived && (
                <span className="badge badge-archived" style={{ marginLeft: 6 }}>
                  Archivé
                </span>
              )}
            </td>
            <td>{p.revenusN1.toLocaleString("fr-FR")} FCFA</td>
            <td>{p.revenusN.toLocaleString("fr-FR")} FCFA</td>
            <td style={{ color: p.diff >= 0 ? "#16a34a" : "#dc2626" }}>
              {p.diff.toLocaleString("fr-FR")} FCFA
            </td>
            <td>{p.pct}%</td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div> */}
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
 border-radius: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
}

/* Autorisation accordée - bouton actif */
button.export-excel.enabled {
  background-color: #16a34a; /* vert */
  color: #fff;
    font-weight:bold;
}

button.export-excel.enabled:hover {
  background-color: #138f3f;
  transform: scale(1.05);
     font-weight:bold;
}

/* Pas d'autorisation - bouton désactivé */
button.export-excel.disabled {
  background-color: #a1a1aa; /* gris clair */
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}
  .badge-gray {
  margin-left: 8px;
  background: #e5e7eb;
  color: #374151;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
}
  .badge-blue {
  margin-left: 6px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
}
  button.export-pdf {
  background-color: #dc2626;
  color: #fff;
   padding: 2px 8px;
   font-weight:bold;
   border-radius: 0.7rem;
}

button.export-pdf:hover {
  background-color: #b91c1c;
   padding: 2px 8px;
  border-radius: 0.7rem;
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
  .badge-archived {
  margin-left: 6px;
  background: #f3f4f6;       
  // color: #6b7280;
  color: red;           
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 500;
  border: 1px dashed red;
}

.payment-table td, .payment-table th {
  white-space: nowrap;
  text-align: right;
}
.payment-table td:first-child { text-align: left; }
.payment-table th:first-child { text-align: left; }
      `}</style>
    </div>
  );
}															