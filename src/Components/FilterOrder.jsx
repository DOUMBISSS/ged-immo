

export default function FilterOrder (){
    return (
        <div>
           <div className="filter--container">
                <div className="filter--container--content">
                <button className="filter__btn">Tous</button>
                <button className="filter__btn">Impayé(s)</button>
                <button className="filter__btn">En attente(s)</button>
                <button className="filter__btn">Payé(s)</button>
                </div>
                {/* <button className="filter__btn">Deliveryed</button> */}
                {/* <button className="filter__btn">Annulé(s)</button> */}
            </div> 
        </div>
    )
}