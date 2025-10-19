import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import Navbar from "./Navbar";
import Footer from "../Pages/Footer";
import 'react-toastify/dist/ReactToastify.css';

const API = "http://localhost:4000";

export default function Receipt() {
  const { rentId } = useParams();
  const [person, setPerson] = useState(null);
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: person ? `${person.name} ${person.prenom} - Reçu` : "Reçu",
  });

  useEffect(() => {
    const fetchRental = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/rents/receipt/${rentId}`);
        if (!res.ok) throw new Error("Impossible de récupérer les données.");
        const data = await res.json();

        setRental(data.rental || data); // selon le retour API
        setPerson(data.person || data.person_id);
      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error("Erreur lors de la récupération du reçu.");
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [rentId]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <p>Chargement du reçu...</p>
      </div>
    );

  if (error)
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        {error}
      </p>
    );

  if (!person || !rental)
    return (
      <p style={{ textAlign: "center" }}>
        Aucune donnée disponible
      </p>
    );

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString("fr-FR") + " FCFA";
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString("fr-FR") : "N/A";
  const formatMonth = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString("fr-FR", { month: "long" }) : "N/A";

  const home = rental.home || {};

  return (
    <>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          <div className="right">
            <div className="firstly">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to='/Accueil'>Home</Link></li>
                  <li className="breadcrumb-item"><Link to='/users'>Liste Locataires</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Reçu de paiement</li>
                </ol>
              </nav>

              <div className="container__print">
                <button className="btn__print" onClick={handlePrint}>Imprimer / Télécharger PDF</button>
              </div>

              <div ref={componentRef} style={{ width: '100%', minHeight: '100vh' }}>
                <div className="receipt__container">
                  <h1 className="receipt__title" style={{ textAlign: "center" }}>Reçu paiement N° {rental.receipt_number || rental._id}</h1>

                  <div className="description__persons" style={{ display: "flex", justifyContent: "space-between", margin: "1rem 0" }}>
                    <div className="description__persons__owner">
                      <h5><u>Le propriétaire</u></h5>
                      <p>SCI MAYEDO</p>
                      <p>+225 07 77 88 00 82</p>
                      <p>sci@mayedo.ci</p>
                      <p>Cocody Angré 8ème Tranche</p>
                    </div>
                    <div className="description__persons__roomer">
                      <h5><u>Le locataire</u></h5>
                      <p><strong>M. {person.name} {person.prenom}</strong></p>
                      <p>{person.tel || person.number}</p>
                      <p>{person.email}</p>
                      <p>{person.address}, {person.city}</p>
                    </div>
                  </div>

                  <div className="receipt__description" style={{ marginTop: "2rem" }}>
                    <p>Reçu de <strong>M. {person.name} {person.prenom}</strong></p>
                    <p>La somme de <strong>{formatCurrency(rental.amount || rental.home_rent)}</strong></p>
                    <p>Le <strong>{formatDate(rental.date_of_payment)}</strong></p>
                    <p>
                      Pour le loyer du/de <strong>{home.categorie || "Logement"} {home.NmbrePieces ? `(${home.NmbrePieces} pièces)` : ""}</strong> situé à : <strong>{home.addressHome}</strong>
                      {home.quarter && <>, Quartier : <strong>{home.quarter}</strong></>}
                      {home.city && <>, Ville : <strong>{home.city}</strong></>}
                    </p>
                    <p>Loyer mensuel : <strong>{formatCurrency(home.rent)}</strong></p>
                    <p>Paiement du mois de : <strong>{formatMonth(rental.month)}</strong></p>

                    <div style={{ textAlign: "right", marginTop: "2rem" }}>
                      <p>Fait à Abidjan le <strong>{formatDate(rental.date_of_payment)}</strong></p>
                      <p><strong>Cachet & Signature du Propriétaire</strong></p>
                      <div>
                        <img src={`${process.env.PUBLIC_URL}/IMG_8945.jpg`} alt="Signature" style={{ maxWidth: "150px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}