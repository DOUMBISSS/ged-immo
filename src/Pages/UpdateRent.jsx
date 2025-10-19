import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams ,Link} from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from "../Components/Sidebar";
import 'react-toastify/dist/ReactToastify.css';
import { getPerson, getRent } from "../Redux/actions";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function UpdateRent({ modalUpdate, setModalUpdate }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const person = useSelector(state => state.peopleReducer.person);
    const [name, setName] = useState("");
    const [prenom, setPre] = useState("");
    const [rent, setMontant] = useState("");
    const [date_of_payment, setDate] = useState("");
    const [month, setMonth] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("");
    const [time, setTime] = useState("");
    const [mode, setMode] = useState("");

    const delDisplayUpdate = () => {
        setModalUpdate(false);
    };

    const back = (rentId) => {
        navigate(`/updateRent/${rentId}`);
      };


    useEffect(() => {
        const fetchRent = async () => {
            try {
                const response = await fetch(`http://localhost:4000/rents/${id}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const rentData = await response.json();
                dispatch(getRent(rentData));
                setMontant(rentData.rent);
                setDate(rentData.date_of_payment);
                setTime(rentData.time);
                setStatus(rentData.status);
                setMode(rentData.mode);
                setMonth(rentData.month);
                setAddress(person.address);
                setName(person.name);
                setPre(person.prenom);
            } catch (error) {
                console.error('Error fetching rent:', error);
                toast.error('Failed to fetch rent data');
            }
        };

        fetchRent();
    }, [dispatch, id, person]);

    const handleUpdate = () => {
        const dataForm = { date_of_payment, month, status, time, mode };
        fetch((`http://localhost:4000/updateRent/${id}`), {
            method: "PUT",
            headers: { 'Accept': "application/json", 'Content-Type': "application/json" },
            body: JSON.stringify(dataForm)
        })
        .then((res) => res.json())
        .then(() => {
            toast.success('Mise à jour effectuée avec succès !!!');
            navigate(`/detailUser/${person._id}`); // Redirect after update
        })
        .catch(err => {
            console.error('Error updating rent:', err);
            toast.error('Failed to update rent');
        });
    };

    return (
        <div>
            <Navbar/>
            <div className="containers">
                <div className="dashboard">
                    {/* <div className="left">        
                        <Sidebar/>
                    </div> */}
                    <div className="right">
                        <div className="firstly">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to='/Accueil'>Home</Link></li>
                                    <li className="breadcrumb-item " aria-current="page"><Link to='/users'>Locataires</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Details du profils</li>
                                </ol>
                            </nav>
                           <div className="ml__btn">
                           <button onClick={() => navigate(`/detailUser/${person._id}`)} className='btn__back'><i class="fa-solid fa-arrow-left"></i></button>
                           </div>
                            <div className="container__update__rent ">
                                <div className="container__payment__content">
                                    <h3>Mise à jour du paiement</h3>
                                    <form className="row g-3">
                                        <div className="col-md-12">
                                            <p>Noms : {name}</p>
                                            <p>Prenoms : {prenom}</p>
                                            {person.home_id?.map((home, _id) =>
                                                <div key={_id}>
                                                    <p>Bien occupé : {home.categorie} </p>
                                                    <p>Addresse : {home.address}</p>
                                                    <p>Loyer mensuel : {home.rent} FCFA</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="validationDefault02" className="form-label">Date de paiement</label>
                                            <input type="date" className="form-control" id="validationDefault02" required onChange={(e) => setDate(e.target.value)} value={date_of_payment || ""} />
                                        </div>
                                        <div className="col-md-2">
                                            <label htmlFor="validationDefault02" className="form-label">Temps</label>
                                            <input type="time" className="form-control" id="validationDefault02" required onChange={(e) => setTime(e.target.value)} value={time || ""} />
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="validationDefault02" className="form-label">Mode de paiement</label>
                                            <select className="form-select" aria-label="Default select example" required onChange={(e) => setMode(e.target.value)} value={mode}>
                                                <option value="">Sélectionner</option>
                                                <option value="Versement">Versement</option>
                                                <option value="Virement">Virement</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="validationDefault02" className="form-label">Mois</label>
                                            <input type="month" className="form-control" id="validationDefault02" required onChange={(e) => setMonth(e.target.value)} value={month} />
                                        </div>
                                        <div className="col-md-5">
                                            <label htmlFor="validationDefault02" className="form-label">Domicile</label>
                                            <input type="text" className="form-control" id="validationDefault02" required onChange={(e) => setAddress(e.target.value)} value={address} />
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="validationDefault02" className="form-label">Statut</label>
                                            <select className="form-select" aria-label="Default select example" onChange={(e) => setStatus(e.target.value)} value={status}>
                                                <option value="">Sélectionner</option>
                                                <option value="Payé">Payé</option>
                                            </select>
                                        </div>
                                        <div className="btn--block--update">
                                            <button className="btn__" type="button" onClick={delDisplayUpdate}>Annuler</button>
                                            <button className="btn__" type="button" onClick={handleUpdate}>Enregistrer</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>  
                    </div>
                </div>
                {/* <ToastContainer position="top-right" autoClose={10000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light"/> */}
            </div>
            <Footer/>
        </div>
    );
}