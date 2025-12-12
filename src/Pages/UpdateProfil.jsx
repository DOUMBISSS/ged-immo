import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Footer from "./Footer";
import { useUserContext } from '../contexts/UserContext';
import Navbar from "./Navbar";

export default function UpdateProfil() {
  let id = useParams().id;
  const navigate = useNavigate();
  const { user, clearUser,getAuthHeaders } = useUserContext(); // Access context
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUserName] = useState('');
  const [prenom, setPrenom] = useState('');
  const [address, setAddress] = useState('');
  const [numero, setNumero] = useState('');
      const [uploads, setUpload] = useState(null);

  const handleFileChange = (e) => {
    setUpload(e.target.files); // Store multiple file objects
};


  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect if not logged in
      return;
    }

    setName(user.name);
    setPrenom(user.prenom);
    setNumero(user.numero);
    setEmail(user.email);
    setUserName(user.username);
    setAddress(user.address);
  }, [user, navigate]);

  const handleUpdateProfil = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const dataUpdate = {
      name, prenom, address, numero, email, username, id,
    };

    try {
      const response = await fetch(`https://backend-ged-immo.onrender.com/updateUser/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dataUpdate)
      });

      if (response.ok) {
        // Assume update was successful
        localStorage.clear();
        navigate('/');
      } else {
        console.error('Update failed');
        // Handle error (e.g., show error message to user)
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div>
      <div className='container__update__profil'>
        <div className=''></div>
      </div>
      <Navbar />
      <div className="containers">
        <div className="dashboard">
          {/* <div className="left">
            <Sidebar />
          </div> */}
          <div className="right">
            <div className="firstly">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to='/Accueil'>Home</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Paramètre du compte</li>
                </ol>
              </nav>
              <div className="profil__content__box">
                <h1 className="firstly__title"><i className="fa-solid fa-user"></i>  Mise à jour du profil</h1>
              </div>

              <div className="profil__container">
                <div className="profil__second__part">
                  <p>Paramètre du compte</p>
                  <form className="row g-3 needs-validation" noValidate onSubmit={handleUpdateProfil}>
                    <div className="col-md-5">
                      <label htmlFor="validationCustom01" className="form-label">Nom</label>
                      <input type="text" className="form-control" id="validationCustom01" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="validationCustom02" className="form-label">Prenoms</label>
                      <input type="text" className="form-control" id="validationCustom02" required value={prenom} onChange={e => setPrenom(e.target.value)} />
                    </div>
                    <div className="col-md-5">
                      <label htmlFor="validationCustom01" className="form-label">Username</label>
                      <input type="text" className="form-control" id="validationCustom01" required value={username} onChange={e => setUserName(e.target.value)} />
                    </div>
              
                    <div className="col-md-5">
                      <label htmlFor="validationCustom03" className="form-label">Addresse</label>
                      <input type="text" className="form-control" id="validationCustom03" required value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div className="col-md-5">
                      <label htmlFor="validationCustom03" className="form-label">Contacts</label>
                      <input type="text" className="form-control" id="validationCustom03" required value={numero} onChange={e => setNumero(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="validationCustom02" className="form-label">Email</label>
                      <input type="email" className="form-control" id="validationCustom02" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="input-group mb-3">
                         <input type="file" className="form-control" id="inputGroupFile02" onChange={handleFileChange} name="userUploads" />
                          <label className="input-group-text" htmlFor="inputGroupFile02">Télécharger</label>
                                </div>
                    <div className="col-12">
                      <button className="btn__cancel" type="button" onClick={() => navigate('/Accueil')}>Annuler</button>
                      <button className="btn__form" type="submit">Enregistrer</button>
                    </div>
                  </form>
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}