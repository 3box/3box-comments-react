import React from 'react';
import SVG from 'react-inlinesvg';

import Logo from '../assets/3BoxLogo.svg';
import './styles/Footer.scss';

const Footer = () => (
  <footer>
    <span className="footer_text">
      Decentralized comments by
      <a href="https://3box.io" target="_blank" rel="noopener noreferrer">
        <SVG src={Logo} alt="Logo" className="footer_text_image" />
      </a>
    </span>
  </footer>
)

export default Footer;