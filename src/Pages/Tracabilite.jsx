import React, { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Blocks } from "react-loader-spinner";
import { useUserContext } from "../contexts/UserContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Tracabilite() {
  const { user } = useUserContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    if (!user?.token) return;

    const fetchTraces = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/Actions", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (data.success) setLogs(data.traces);
        else toast.error(data.message || "Erreur récupération des traces");
      } catch {
        toast.error("Erreur de chargement des logs");
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, [user]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.createdAt);
      if (startDate && logDate < new Date(startDate)) return false;
      if (endDate && logDate > new Date(endDate + "T23:59:59")) return false;
      if (roleFilter && log.performedBy?.role !== roleFilter) return false;
      if (typeFilter && log.type !== typeFilter) return false;
      return true;
    });
  }, [logs, startDate, endDate, roleFilter, typeFilter]);

  // 🔹 Fonctions pour styles badges
  const actionColors = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    ARCHIVE: "bg-yellow-100 text-yellow-800",
    LOGIN: "bg-purple-100 text-purple-800",
  };

  const roleColors = {
    admin: "bg-indigo-100 text-indigo-800",
    user: "bg-gray-100 text-gray-800",
  };

  return (
    <>
      <Navbar />
      <div className="tracabilite-container">
        <Toaster />
        <h2 className="title">🕵️ Journal de traçabilité</h2>

        {/* 🔹 Section filtres */}
        <div className="filters">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Date début"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Date fin"
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Tous les types</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="ARCHIVE">ARCHIVE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setRoleFilter("");
              setTypeFilter("");
            }}
          >
            Réinitialiser
          </button>
        </div>

        {loading ? (
          <div className="loader-wrapper">
            <Blocks visible={true} height="80" width="100%" ariaLabel="loading" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="tracabilite-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Détails</th>
                  <th>Effectué par</th>
                  <th>Rôle</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      Aucune action correspondante
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className={`badge ${actionColors[log.type] || ""}`}>
                          {log.type}
                        </span>{" "}
                        {log.action}
                      </td>
                      <td>{log.details}</td>
                      <td>{log.performedBy?.name || "Inconnu"}</td>
                      <td>
                        <span className={`badge ${roleColors[log.performedBy?.role] || ""}`}>
                          {log.performedBy?.role || "N/A"}
                        </span>
                      </td>
                      <td>
                        {new Date(log.createdAt).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />

      <style jsx="true">{`
        .tracabilite-container {
          max-width: 1600px;
          margin: 40px auto;
          padding: 30px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          font-family: "Inter", sans-serif;
          color: #1f2937;
        }

        .title {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #111827;
          text-align: center;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .filters input,
        .filters select {
          padding: 10px 15px;
          border-radius: 12px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }

        .filters button {
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          background-color: #4f46e5;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .filters button:hover {
          background-color: #6366f1;
        }

        .loader-wrapper {
          display: flex;
          justify-content: center;
          padding: 50px 0;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .tracabilite-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 1.05rem;
        }

        .tracabilite-table th {
          background: linear-gradient(90deg, #4f46e5, #6366f1);
          color: #fff;
          font-weight: 600;
          padding: 15px 20px;
          text-align: left;
          position: sticky;
          top: 0;
          z-index: 10;
          border-radius: 12px 12px 0 0;
        }

        .tracabilite-table td {
          background: #f9fafb;
          padding: 15px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .tracabilite-table tbody tr:nth-child(even) td {
          background: #f3f4f6;
        }

        .tracabilite-table tbody tr:hover td {
          background: #e0e7ff;
          transition: 0.3s;
        }

        .no-data {
          text-align: center;
          font-style: italic;
          color: #6b7280;
          padding: 30px 0;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          margin-right: 5px;
        }

        @media (max-width: 1024px) {
          .tracabilite-container {
            padding: 20px;
            margin: 20px;
          }

          .title {
            font-size: 2.2rem;
          }

          .tracabilite-table th,
          .tracabilite-table td {
            padding: 12px 15px;
          }
        }
      `}</style>
    </>
  );
}