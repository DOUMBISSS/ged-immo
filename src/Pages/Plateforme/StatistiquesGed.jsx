import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";
import RenewSubscriptionModal from "../components/RenewSubscriptionModal"; // ← importer le modal

export default function StatistiquesGed() {
  const { user } = useUserContext();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // 🔹 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    if (!user?.token) return;

    const fetchGedOverview = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://backend-ged-immo.onrender.com/superadmin/overview", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Erreur de chargement des statistiques");
          return;
        }

        setAdmins(data.admins || []);
      } catch (err) {
        toast.error("Erreur serveur : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGedOverview();
  }, [user]);

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchSearch =
        a.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [admins, searchTerm]);

  const handleRenewModal = (admin) => {
    setSelectedAdmin(admin);
    setModalOpen(true);
  };

  const handleRenewSuccess = (newEndDate) => {
    toast.success(`Abonnement de ${selectedAdmin.fullname} prolongé !`);
    // mettre à jour localement
    setAdmins((prev) =>
      prev.map((a) =>
        a._id === selectedAdmin._id ? { ...a, subscriptionEnd: newEndDate } : a
      )
    );
  };

  if (loading)
    return (
      <div className="loading">
        <TailSpin height="80" width="80" color="#4fa94d" />
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="saas-container">
        <div className="saas-card">
          <h2>Tableau de bord GED IMMO</h2>

          {/* 🔍 Filtre */}
          <div className="filter-section">
            <input
              type="text"
              placeholder="Rechercher un admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* 📋 Tableau */}
          <table className="saas-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Abonnement</th>
                <th>Détails</th>
                <th>Renouveler</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length ? (
                filteredAdmins.map((a) => (
                  <tr key={a._id}>
                    <td>{a.fullname}</td>
                    <td>{a.email}</td>
                    <td>{a.subscriptionEnd ? new Date(a.subscriptionEnd).toLocaleDateString() : "—"}</td>
                    <td>
                      <Link to={`/ged/admin/${a._id}`}>
                        <button className="btn-details">Voir</button>
                      </Link>
                    </td>
                    <td>
                      <button
                        className="btn-renew"
                        onClick={() => handleRenewModal(a)}
                      >
                        Renouveler
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Aucun administrateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />

      {/* 🔹 Modal */}
      {modalOpen && selectedAdmin && (
        <RenewSubscriptionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          admin={selectedAdmin}
          onRenew={handleRenewSuccess}
        />
      )}

      {/* --- Styles simplifiés --- */}
      <style>{`
        .btn-renew { background:#2563eb; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; }
        .saas-table { width:100%; border-collapse:collapse; margin-top:1rem; }
        .saas-table th, .saas-table td { border:1px solid #e5e7eb; padding:0.6rem; text-align:left; }
        .btn-details { background:#22c55e; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; }
      `}</style>
    </div>
  );
}