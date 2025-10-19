import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { getPerson } from "../Redux/actions";
import Navbar from "./Navbar";
import Footer from './Footer';
// import { FaMoneyBillWave, FaCalendarAlt, FaRegClock, FaRegCreditCard } from "react-icons/fa";

export default function Paiement() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
      const [person, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [date_of_payment, setDate] = useState("");
    const [month, setMonth] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("");
    const [time, setTime] = useState("");
    const [mode, setMode] = useState("");
    const [montant, setMontant] = useState("");
    const [reference, setReference] = useState("");

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                const response = await fetch(`https://mayedo.onrender.com/persons/${id}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const personData = await response.json();
                // dispatch(getPerson(personData));
                setAddress(personData.address);
            } catch (error) {
                console.error('Error fetching person:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerson();
    }, [dispatch, id]);

    const handleAdd = () => {
    // ✅ Vérification doublon mois avant envoi
    const duplicate = person.rentals?.some(r => r.month === month);
    if (duplicate) {
      toast.error(`⚠️ Paiement pour le mois ${new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })} déjà enregistré !`);
      return;
    }

    const dataForm = { date_of_payment, month, status, time, person_id: id, mode };

    fetch('http://localhost:4000/rents', {
      method: "POST",
      headers: { 'Accept': "application/json", 'Content-Type': "application/json" },
      body: JSON.stringify(dataForm)
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        toast.success("✅ Paiement ajouté avec succès !");
        navigate(`/detailUser/${id}`);
      } else {
        toast.error("❌ " + result.message);
      }
    })
    .catch(err => {
      console.error(err);
      toast.error("❌ Erreur serveur");
    });
  };

    if (loading) return <p className="loading-text">Chargement...</p>;

    return (
        <div>
            <Navbar />
            <div className="containers">
                <div className="dashboard">
                    {/* <div className="left">
                        <Sidebar />
                    </div> */}
                    <div className="right">
                        <div className="firstly">
                            <nav aria-label="breadcrumb" className="mb-3">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to='/Accueil'>Home</Link></li>
                                    <li className="breadcrumb-item"><Link to='/users'>Liste Locataires</Link></li>
                                    <li className="breadcrumb-item"><Link to={`/detailUser/${id}`}>Profil</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Ajout Paiement</li>
                                </ol>
                            </nav>

                            <div className="payment-card">
                                <h2 className="payment-title"> Ajouter un paiement</h2>
                                <p className="payment-subtitle">Veuillez remplir les informations ci-dessous pour enregistrer un paiement.</p>

                                {/* Résumé locataire */}
                                <div className="tenant-summary">
                                    <h4>📌 Informations Locataire</h4>
                                    <p><strong>Nom :</strong> {person.name} {person.prenom}</p>
                                    {person.home_id?.map((home, _id) =>
                                        <div key={_id} className="tenant-home">
                                            <p><strong>Bien :</strong> {home.categorie}</p>
                                            <p><strong>Adresse :</strong> {home.addressHome}</p>
                                            <p><strong>Loyer :</strong> {home.rent} FCFA</p>
                                        </div>
                                    )}
                                </div>

                                {/* Formulaire */}
                                <form className="payment-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date de paiement</label>
                                            <div className="input-icon">
                                                <input type="date" required value={date_of_payment} onChange={(e) => setDate(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Heure</label>
                                            <div className="input-icon">
                                                <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Mois concerné</label>
                                            <input type="month" required value={month} onChange={(e) => setMonth(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Mode de paiement</label>
                                            <select required value={mode} onChange={(e) => setMode(e.target.value)}>
                                                <option value="">Sélectionner</option>
                                                <option value="Versement">Versement</option>
                                                <option value="Virement">Virement</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Mobile Money">Mobile Money</option>
                                            </select>
                                        </div>
                                        {/* <div className="form-group">
                                            <label>Référence transaction</label>
                                            <div className="input-icon"><FaRegCreditCard />
                                                <input type="text" placeholder="Ex: TXN123456" value={reference} onChange={(e) => setReference(e.target.value)} />
                                            </div>
                                        </div> */}
                                        {/* <div className="form-group">
                                            <label>Montant payé</label>
                                            <input type="number" placeholder="Ex: 150000" value={montant} onChange={(e) => setMontant(e.target.value)} />
                                        </div> */}
                                    </div>

                                    <div className="form-row">
                                        {/* <div className="form-group">
                                            <label>Adresse domicile</label>
                                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                                        </div> */}
                                        <div className="form-group">
                                            <label>Statut</label>
                                            <select required value={status} onChange={(e) => setStatus(e.target.value)}>
                                                <option value="">Sélectionner</option>
                                                <option value="Payé">✅ Payé</option>
                                                {/* <option value="Partiel">⚠️ Partiel</option>
                                                <option value="Non Payé">❌ Non Payé</option> */}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Boutons */}
                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={() => navigate(`/detailUser/${id}`)}>Annuler</button>
                                        <button type="button" className="btn-submit" onClick={handleAdd}>Enregistrer</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
            <Footer />
        </div>
    );
}