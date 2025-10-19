import React, { useEffect, useState } from "react";
import { useUserContext } from "../contexts/UserContext";
import { Blocks } from "react-loader-spinner";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { toast } from "react-toastify";

export default function Notifications() {
  const { user } = useUserContext();
  const [unpaidRents, setUnpaidRents] = useState([]);
  const [expiredContracts, setExpiredContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // 🔹 Récupération des loyers impayés
        const rentsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/rents/unpaid/${user._id}`
        );
        const rentsData = await rentsRes.json();

        // 🔹 Récupération des baux expirés
        const contractsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/contracts/expired/${user._id}`
        );
        const contractsData = await contractsRes.json();

        setUnpaidRents(rentsData || []);
        setExpiredContracts(contractsData || []);
      } catch (error) {
        console.error("Erreur chargement notifications :", error);
        toast.error("Erreur lors du chargement des notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
      <Navbar />

      <div className="container" style={{ padding: "30px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "25px" }}>📢 Notifications</h2>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
            <Blocks height="80" width="80" color="#4f46e5" ariaLabel="loading" />
          </div>
        ) : (
          <>
            {/* 🔴 Loyers impayés */}
            <section style={{ marginBottom: "40px" }}>
              <h3 style={{ color: "#dc2626" }}>🔴 Loyers impayés</h3>
              {unpaidRents.length > 0 ? (
                <div className="notif-card">
                  {unpaidRents.map((rent, index) => (
                    <div key={index} className="notif-item">
                      <p>
                        <strong>{rent.tenantName}</strong> n’a pas payé le loyer du logement{" "}
                        <strong>{rent.homeName}</strong> ({rent.month}/{rent.year})
                      </p>
                      <p>
                        Montant dû :{" "}
                        <strong>{Number(rent.amount).toLocaleString("fr-FR")} FCFA</strong>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#4b5563" }}>Aucun loyer impayé pour le moment ✅</p>
              )}
            </section>

            {/* ⚠️ Contrats expirés */}
            <section>
              <h3 style={{ color: "#f59e0b" }}>⚠️ Contrats de bail expirés</h3>
              {expiredContracts.length > 0 ? (
                <div className="notif-card">
                  {expiredContracts.map((contract, index) => (
                    <div key={index} className="notif-item">
                      <p>
                        Le contrat du locataire{" "}
                        <strong>{contract.tenantName}</strong> pour{" "}
                        <strong>{contract.homeName}</strong> a expiré le{" "}
                        <strong>
                          {new Date(contract.endDate).toLocaleDateString("fr-FR")}
                        </strong>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#4b5563" }}>Aucun contrat expiré pour le moment ✅</p>
              )}
            </section>
          </>
        )}
      </div>

      <Footer />

      {/* Styles rapides */}
      <style jsx>{`
        .notif-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          padding: 15px 20px;
          margin-top: 10px;
        }
        .notif-item {
          border-bottom: 1px solid #e5e7eb;
          padding: 10px 0;
        }
        .notif-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}