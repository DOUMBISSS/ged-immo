import { useState } from "react";
import { useEffect,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { getPerson, getRent,addPayment } from "../Redux/actions";
import { TailSpin } from "react-loader-spinner";


export default function PaiementModal({pay,setPay}){
    const dispatch =useDispatch

    const navigate = useNavigate();
    const person = useSelector(state=>state.peopleReducer.person);
    let id = useParams().id;
    // let person =persons.find(person => person.id == id);

    const [name,setName]=useState("");
    const [prenom,setPre]=useState("");
    const [rent,setMontant]=useState("");
    const [date_of_payment,setDate]=useState("");
    const [month,setMonth]=useState("");
    const [address,setAddresse]=useState("");
    const [status,setStatus]=useState("");
    const [time,setTime]=useState("");
    const [mode,setMode]=useState("");


    useEffect(()=>{
        setName(person.name);
        setPre(person.prenom);
        // setMontant(person.home.rent);
        setAddresse(person.address)
    }, [person])

    const payDisplay = () =>{
        setPay(false)
    }

    const handleName = (event) =>{
        setName(event.target.value)
    }
    const handlePre = (event) =>{
        setPre(event.target.value)
    }
    const handleMontant = (event) =>{
        setMontant(event.target.value)
    }
    const handleDate = (event) =>{
        setDate(event.target.value)
    }
    const handleMonth = (event) =>{
        setMonth(event.target.value)
    }
    const handleStatus = (event) =>{
        setStatus(event.target.value)
    }
    const handleAddresse = (event) =>{
        setAddresse(event.target.value)
    }

    const handleTime = (event) =>{
        setTime(event.target.value)
    }

    const handleMode = (event) =>{
        setMode(event.target.value)
    }

    const notify = (e) => {
        toast('Paiement ajouté avec succès!!', {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      };


    const handleAdd = (e) =>{
        const dataForm = {
          date_of_payment,month,status,time,person_id:id,mode
        }
        fetch('https://backend-ged-immo.onrender.com/rents',{
              method:"POST",
              headers :{'Accept':"application/json",'Content-Type':"application/json"},
              body: JSON.stringify(dataForm)
          }).then((res)=>res.json())
          .then((dataPayment)=> dispatch(addPayment(dataPayment))) 
            .catch(err => {console.log(err)})
            notify("");
            navigate(`/detailUser/${person._id}`);
            console.log(dataForm)
      };
  
    return (
            <div>
                <div className={pay ? "container__payment__modal open__payment__modal" : "container__payment__modal"}>
                              <div className="container__payment__header">
                              <h3 className="gle">#Ajouter un nouveau paiement</h3>
                              <i className="fa-solid fa-xmark" onClick={payDisplay}></i>
                              </div>

                                <form className="row g-3" key={person._id}>
                                    <div className="col-md-12">
                                       <p>Noms : {person.name}</p>
                                       <p>Prenoms : {person.prenom}</p>
                                        {person.home_id?.map((home,_id) =>
                                                <div>
                                                <p>Bien occupé : {home.categorie} </p>
                                                <p>Addresse : {home.address}</p>
                                                <p>Loyer mensuel : {home.rent} FCFA</p>
                                                </div>
                                       )}
                                       </div>
                                       <div className="col-md-6">
                                        <label htmlFor="validationDefault02" className="form-label">Date de paiement</label>
                                        <input type="date" className="form-control" id="validationDefault02" required  onChange={handleDate} value={date_of_payment|| ""}/>
                                    </div>
                                    <div className="col-md-2">
                                        <label htmlFor="validationDefault02" className="form-label">Temps</label>
                                        <input type="time" className="form-control" id="validationDefault02" required  onChange={handleTime} value={time || ""} />
                                    </div>
                                    <div className="col-md-2">
                                        <label htmlFor="validationDefault02" className="form-label">Mode de paiement</label>
                                        <select class="form-select" aria-label="Default select example" required onChange={handleMode} value={mode}>
                                                <option value>Sélectionner</option>
                                                <option value="Versement">Versement</option>
                                                <option value="Virement">Virement</option>
                                                </select>
                                    </div>
                                    {/* <div className="col-md-3">
                                        <label htmlFor="validationDefault02" className="form-label">Mois</label>
                                        <select class="form-select" aria-label="Default select example" required onChange={handleMonth} value={month}>
                                                <option selected>Sélectionner</option>
                                                <option value="Janvier">Janvier</option>
                                                <option value="Février">Février</option>
                                                <option value="Mars">Mars</option>
                                                <option value="Avril">Avril</option>
                                                <option value="Mai">Mai</option>
                                                <option value="Juin">Juin</option>
                                                <option value="Juillet">Juillet</option>
                                                <option value="Août">Août</option>
                                                <option value="Septembre">Septembre</option>
                                                <option value="Octobre">Octobre</option>
                                                <option value="Novembre">Novembre</option>
                                                <option value="Décembre">Décembre</option>
                                                </select>
                                    </div> */}
                                    <div className="col-md-3">
                                        <label htmlFor="validationDefault02" className="form-label">Mois</label>
                                        <input type="month" className="form-control" id="validationDefault02" required onChange={handleMonth} value={month} defaultValue="Search..."/>
                                    </div>
                                    
                                    {/* <div className="col-md-4">
                                        <label htmlFor="validationDefault02" className="form-label">Loyer mensuel</label>
                                        <input type="text" className="form-control" id="validationDefault02" required onChange={handleMontant} value={rent} />
                                    </div> */}
                                    <div className="col-md-5">
                                        <label htmlFor="validationDefault02" className="form-label">Domicile</label>
                                        <input type="text" className="form-control" id="validationDefault02" required onChange={handleAddresse} value={address} />
                                    </div>
                                    <div className="col-md-3">
                                    <label htmlFor="validationDefault02" className="form-label">Statut</label>
                                    <select class="form-select" aria-label="Default select example"  onChange={handleStatus} value={status}>
                                        <option selected>Sélectionner</option>
                                        {/* <option value="Impayés">Impayés</option> */}
                                        <option value="Payé">Payé</option>
                                        </select>
                                    </div>
                                    <div className="btn--block--update">
                                            <button className="btn__">Annuler</button>
                                            <button className="btn__" onClick={handleAdd}>Enregistrer</button>
                                    </div>
                                    </form>
                                    {/* <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light"/> */}
             </div>
  
            </div>
    )
}