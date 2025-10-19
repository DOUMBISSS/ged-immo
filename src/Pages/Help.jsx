import { Link } from "react-router-dom";
import FilterOrder from "../Components/FilterOrder";
import Sidebar from "../Components/Sidebar";
import Navbar from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";



export default function Help ( {toogleHelp}){

    const[display,setDisplay]=useState("")


    return (
        <div>
        <div className="containers">
        <Navbar />
        <div className="dashboard">
                        <div className="left">        
                           <Sidebar/>
                            
                        </div>
                        <div className="right">
                       <div className="firstly">
                       <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><Link to='/Accueil'>Home</Link></li>
                                    <li class="breadcrumb-item active" aria-current="page">Loyers</li>
                                </ol>
                            </nav>
                                <div className="firstly__header">
                                {/* <h1><i class="fa-solid fa-circle-question"></i> Aide </h1> */}
                                    <h2 className="help__title"><i>#Guide d'utilisation</i></h2>
                                </div>
                                <div className={toogleHelp ? "container__help open__help__part" : "container__help"}>
                          <div className="btn--close--part">
                                    <i className="fa-solid fa-xmark" onClick={display}></i>
                                </div>
                                    <div className="container__help__content">
                                    <div className="session__connexion">
                                  <h4 className="session__connexion__title">1.Session Connexion</h4>
                                    <p>Saisissez votre compte d'utilisation email {'>'} mot de passe </p>
                                    <div className="session__connexion__images">
                                    <img src={`${process.env.PUBLIC_URL}/dash.png`} alt=''/>
                                    </div>
                                 </div>
                                    <div className="session__connexion">
                                    <h4 className="session__connexion__title">2.Accedez au tableau de bord</h4>
                                    <div className="session__connexion__images">
                                    <img src={`${process.env.PUBLIC_URL}/dash4.png`} alt=''/>
                                    </div>
                                    </div>
                                      <div className="session__connexion">
                                      <h4 className="session__connexion__title">3.Ajouter un nouveau locataire</h4>
                                        {/* <h3>4.Remplissez le formulaire</h3> */}
                                        <p>Saisissez les donneées du nouveau locataire </p>
                                        <div className="session__connexion__images">
                                        <img src={`${process.env.PUBLIC_URL}/ajout.png`} alt=''/>
                                        </div>
                                      </div>
                                       <div className="session__connexion">
                                       <h4 className="session__connexion__title">5.Accédez a la liste des locataires</h4>
                                        <div className="session__connexion__images">
                                        <img src={`${process.env.PUBLIC_URL}/list.png`} alt=''/>
                                        </div>
                                       </div>
                                        <div className="session__connexion">
                                        <h4 className="session__connexion__title">6.Accédez aux details d'un locataire</h4>
                                        <div className="session__connexion__images">
                                        <img src={`${process.env.PUBLIC_URL}/dash3.png`} alt=''/>
                                        </div>
                                        </div>
                                        <div className="session__connexion">
                                        <h4 className="session__connexion__title">7.Effectuez un paiement de loyer</h4>
                                        <div className="session__connexion__images">
                                            <img src={`${process.env.PUBLIC_URL}/pay.png`} alt=''/>
                                        </div>
                                        </div>
                                        <div className="session__connexion">
                                        <h4 className="session__connexion__title">8.Imprimez le reçu</h4>
                                        <div className="session__connexion__images">
                                            <img src={`${process.env.PUBLIC_URL}/print.png`} alt=''/>
                                        </div>
                                        </div>
                                        
                                    </div>
                                  
                                </div>
                              

                             
                            <div>
                            </div>
                           </div>
                       </div> 
                   </div>
    </div>
        </div>
    )
}