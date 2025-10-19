import { Link } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from './Footer';

export default function RentHome() {
    const [homes, setHomes] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // nombre de cartes par page
    const keys = ["nameHome", "categorie"];

    useEffect(() => {
        fetch('http://localhost:4000/homes')
            .then((res) => res.json())
            .then(setHomes)
            .catch((error) => console.error('Error fetching homes:', error));
    }, []);

    // Filtrage
    const filteredHomes = homes.filter(home =>
        keys.some(key =>
            home[key]?.toLowerCase().includes(search.toLowerCase())
        )
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHomes = filteredHomes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHomes.length / itemsPerPage);

    return (
        <>
        <div className="renthome-page">
            <Navbar/>
            <div className="containers">
                <div className="dashboard">
                    {/* <div className="left">
                        <Sidebar />
                    </div> */}
                    <div className="right">
                        <div className="renthome-header">
                            <h1><i className="fa-solid fa-house"></i> Mes propriétés</h1>
                            <div className="renthome-header-actions">
                                <input
                                    type="text"
                                    className="renthome-search"
                                    placeholder="Rechercher par Nom ou Categorie..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1); // reset page sur nouvelle recherche
                                    }}/>
                                <Link to='/add__home'>
                                    <button className="btn-add-home">
                                        <i className="fa-solid fa-plus"></i> Ajouter une maison
                                    </button>
                                </Link>
                                 <div className="dashboard-filters">
                                <select className="form-input" required>
                                    <option value="">Sélectionner le projet</option>
                                    <option value="projet1">Projet 1</option>
                                    <option value="projet2">Projet 2</option>
                                    <option value="projet3">Projet 3</option>
                                </select>
                                </div>
                                
                            </div>
                        </div>

                        <div className="renthome-cards-container">
                            {currentHomes.map((home) => (
                                <div key={home._id} className="renthome-card">
                                    <div className="renthome-card-images">
                                        {home.imageUrl.map((url, index) => (
                                            <img key={index} src={`http://localhost:4000${url}`} alt={`Home ${index}`} className="home-image" />
                                        ))}
                                    </div>
                                    <div className="renthome-card-content">
                                        <h3>{home.nameHome}</h3>
                                        <p className="address">{home.addressHome}</p>
                                        <p className="info">{home.superficie} | {home.categorie}</p>
                                        <p className="rent">{home.rent} F CFA</p>
                                        <p className="description">{home.description}</p>
                                        <p className="guarantee">Caution: {home.guarantee}</p>
                                    </div>
                                    <div className="renthome-card-footer">
                                        <Link to={`/detailHome/${home._id}`}>
                                            <button className="btn-details">
                                                Voir détails <i className="fa-solid fa-arrow-right"></i>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Précédent
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={currentPage === i + 1 ? 'active' : ''}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
       
        </div>
             <Footer/>
        </>
    );
}