import React from 'react';

import Logo from '../assets/3BoxLogo.svg';
import './styles/Footer.scss';

const Footer = () => (
  <footer>
    <span className="footer_text">
      Decentralized comments by
      <img src={Logo} alt="Logo" className="footer_text_image" />
    </span>
  </footer>
)

export default Footer;