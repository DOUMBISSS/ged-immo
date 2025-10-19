import { Link ,useNavigate} from "react-router-dom";
import {signInWithEmailAndPassword,signOut} from "../firebaseConfig"
import {auth} from "../firebaseConfig";
import { toast,ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";


export default function Sidebar(){

    const [user,setUser] = useState("");
  
    const notify = (e) => {
        toast.info('Veuillez vous connecter svp !!', {
          position: "top-right",
          autoClose: 3001,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      };

 

    
    const navigate = useNavigate();
    // const logout = (e) => {
    //     e.preventDefault();
    //       signOut(auth)
    //     .then(() => {
    //       console.log(auth)
    //       navigate("/") 
    //     })
    //     .catch((error) => {
    //       console.log(error)
    //     });
    //     notify('')
    // }

    const logout =()=>{
        localStorage.clear();
        navigate('/');
        notify('')
    
      }
    
    useEffect(() => {
      setUser(JSON.parse(localStorage.getItem("user"))) 
      }, [])

    return (
        <div>
                            {/* <div className="container--admin">
                                <div className="container--admin--content">
                                    <div className="profil--admin">
                                        <img src="https://img1.freepng.fr/20180712/qqw/kisspng-writing-infographic-writer-homework-essay-admin-icon-5b46fc454466f9.2978199715313787572802.jpg" alt="" />
                                    </div>
                                    <p className="profil--name">Doumbia Fode</p>
                                </div>
                            </div> */}
                            <div className="sidebar">
                                <div className="sidebar--item">
                                    <Link to='/Accueil' className="link__sidebar"><p><i class="fa-brands fa-dashcube"></i> Tableau de bord</p></Link>
                                </div>
                                <div className="sidebar--item">
                                    <Link to='/users' className="link__sidebar"><p><i class="fa-solid fa-users"></i> Locataires</p></Link>
                                </div>
                                <div className="sidebar--item">
                                    <Link to='/Mes__projet/fr/' className="link__sidebar"><p><i class="fa-solid fa-house"></i> Mes propriétés</p></Link>
                                </div>
                                <div className="sidebar--item">
                                    <Link to='/statistiques' className="link__sidebar"><p><i class="fa-solid fa-gauge-high"></i> Statistiques</p></Link>
                                </div>
                                {/* <div className="sidebar--item">
                                    <Link to='/statistiques' className="link__sidebar"><p><i class="fa-solid fa-gauge-high"></i> Biens</p></Link>
                                </div> */}
                                {/* <div className="sidebar--item">
                                    <Link to='/notifications' className="link__sidebar"> <p><i class="fa-regular fa-bell"></i> Notifications</p></Link>
                                </div> */}
                                <div className="sidebar--item">
                                    <Link to='/mon-profil' className="link__sidebar"> <p> <i class="fa-solid fa-user"></i> Mon Profil</p></Link>
                                </div>
                            </div>
                            
                            <div className="container__info__assisst">
                            <p><i class="fa-solid fa-phone"></i> Service assistance</p>
                                <p>+225 07 77 88 00 82</p>
                                <p>doumbia77fode@gmail.com</p>
                            </div>
                            <div>
                            <button className="btn__log" onClick={logout}> <i class="fa-solid fa-right-from-bracket"></i> Deconnexion</button>
                            </div>
                            <ToastContainer position="top-right" autoClose={3001} hideProgressBar={true} newestOnTop={false} closeOnClick rtl={false}  pauseOnFocusLoss draggable  pauseOnHover theme="colored"  />
        </div>
    )
}