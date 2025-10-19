import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { coffee } from '@fortawesome/free-brands-svg-icons'
function  Footer () {
            
return (
    <div>
          <div className='footer'>
          <div className='right'>
            <p>Copyright © 2025,GED IMMO </p>
            </div>
          <div className="foot--content">
              <div className='schedule'>
                <h4 className='footer__title'>Horaire d'ouverture</h4>
                  <p>Lundi-Vendredi : 8h-16h</p>
                  <p>Samedi : 9h-12h</p>
              </div>
              
              <div className='address'>
                <h4 className='footer__title'>Contactez-nous</h4>
                <p><i className="fa-solid fa-location-dot"></i> Cocody Angré 7eme Tranche / Abidjan – Plateau – 01 BP 2076 Abidjan 01</p>
                <p><i className="fa-solid fa-phone"></i> +225 07 77 88 00 82</p>
                <p><i className="fa-solid fa-envelope"></i> sci@gedimmo.ci</p>
                <p><i className="fa-solid fa-globe"></i> www.gedimmo.ci</p>
              </div>

              <div className='social--media'>
                <h4 className='footer__title'>Réseaux sociaux</h4>
                  <p><i className="fa-brands fa-facebook"></i>Facebook</p>
                  <p><i className="fa-brands fa-instagram"></i>Instagram</p>
                  <p><i className="fa-brands fa-whatsapp"></i>WhatsApp</p>
                  <p><i className="fa-brands fa-tiktok"></i> Tiktok</p>
              </div>
          </div>

           <div className='name--developer'>
            <p>Developed by Doumbia Fode (+225 0777880082)</p>
           </div>
      </div>
    </div>

    );
}

export default Footer;
