// src/pages/Accueil.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Blocks } from "react-loader-spinner";
import { useUserContext } from "../contexts/UserContext";

const API_BASE = "http://localhost:4000";

export default function Accueil() {
  const { user } = useUserContext();
  const [persons, setPersons] = useState([]);
  const [projects, setProjects] = useState([]); // logements/projets
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // 🔹 Récupération unifiée des données
  useEffect(() => {
    if (!user?._id || !user?.token) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/data/${user._id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Erreur récupération des données.");
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

  // 🔹 Filtrage par nom + date
  const filteredPersons = useMemo(() => {
    return persons.filter((person) => {
      const matchSearch =
        person.name?.toLowerCase().includes(search.toLowerCase()) ||
        person.prenom?.toLowerCase().includes(search.toLowerCase());

      let matchDate = true;
      if ((monthFilter || yearFilter) && person.rentals?.length > 0) {
        matchDate = person.rentals.some((r) => {
          const paymentDate = new Date(r.date_of_payment);
          const matchMonth = monthFilter
            ? paymentDate.getMonth() + 1 === Number(monthFilter)
            : true;
          const matchYear = yearFilter
            ? paymentDate.getFullYear() === Number(yearFilter)
            : true;
          return matchMonth && matchYear;
        });
      }

      return matchSearch && matchDate;
    });
  }, [persons, search, monthFilter, yearFilter]);

  // 🔹 Statistiques globales
  const totalLocataires = persons.length;
  const totalLoyersPayes = persons.reduce(
    (acc, p) => acc + (p.rentals?.filter((r) => r.status === "Payé").length || 0),
    0
  );
  const totalLoyersImpayes = persons.reduce(
    (acc, p) => acc + (p.rentals?.filter((r) => r.status !== "Payé").length || 0),
    0
  );
  const logementsOccupes = projects.filter((h) => h.status === "Occupé").length;
  const logementsVacants = projects.filter((h) => h.status !== "Occupé").length;

  const pieData = {
    labels: ["Payés", "Impayés"],
    datasets: [
      {
        data: [totalLoyersPayes, totalLoyersImpayes],
        backgroundColor: ["#4CAF50", "#F44336"],
        hoverOffset: 6,
      },
    ],
  };

  const barData = {
    labels: ["Occupés", "Vacants"],
    datasets: [
      {
        label: "Logements",
        data: [logementsOccupes, logementsVacants],
        backgroundColor: ["#2563EB", "#FBBF24"],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      {loading ? (
        <div className="dashboard-loader">
          <Blocks visible={true} height="80" width="100%" color="#4fa94d" ariaLabel="loading" />
        </div>
      ) : (
        <div className="dashboard-main">
          <h2 className="dashboard-title">📊 Tableau de bord</h2>

          {/* Cartes statistiques */}
          <div className="dashboard-cards">
            <div className="card card-primary">
              <i className="fa-solid fa-users"></i>
              <div>
                <h4>Total Locataires</h4>
                <span>{totalLocataires}</span>
              </div>
            </div>
            <div className="card card-success">
              <i className="fa-solid fa-money-bill-wave"></i>
              <div>
                <h4>Loyers Payés</h4>
                <span>{totalLoyersPayes}</span>
              </div>
            </div>
            <div className="card card-danger">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <div>
                <h4>Loyers Impayés</h4>
                <span>{totalLoyersImpayes}</span>
              </div>
            </div>
            <div className="card card-info">
              <i className="fa-solid fa-building"></i>
              <div>
                <h4>Logements Occupés</h4>
                <span>{logementsOccupes}</span>
              </div>
            </div>
            <div className="card card-warning">
              <i className="fa-solid fa-door-open"></i>
              <div>
                <h4>Logements Vacants</h4>
                <span>{logementsVacants}</span>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="dashboard-charts">
            <div className="chart-card">
              <h4>Répartition des loyers payés vs impayés</h4>
              <Pie data={pieData} />
            </div>
            <div className="chart-card">
              <h4>Logements Occupés vs Vacants</h4>
              <Bar data={barData} />
            </div>
          </div>

          {/* Filtres */}
          <div className="dashboard-filters">
            <input
              type="text"
              placeholder="Rechercher locataire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="">Filtrer par mois</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("fr-FR", { month: "long" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Filtrer par année"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Tableau des locataires */}
          <div className="dashboard-table">
            <h4>Liste complète des locataires</h4>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Dernier paiement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersons.map((person) => {
                  const lastRental = person.rentals?.slice(-1)[0];
                  return (
                    <tr key={person._id}>
                      <td>{person.name}</td>
                      <td>{person.prenom}</td>
                      <td>{person.tel}</td>
                      <td>{person.email}</td>
                      <td>
                        {lastRental?.date_of_payment
                          ? new Date(lastRental.date_of_payment).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            lastRental?.status === "Payé" ? "badge-paid" : "badge-unpaid"
                          }`}
                        >
                          {lastRental?.status || "Non payé"}
                        </span>
                      </td>
                      <td>
                        <Link to={`/users/${person._id}`} className="btn btn-view">
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}