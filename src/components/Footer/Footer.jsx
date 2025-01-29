import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear()
  const navigate = useNavigate();
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <img className='tomatologofooter' src={assets.logo} alt="" />
          <p>This website is just for my portfolio, it's not a real website.</p>
          <div className='footer-social-icons'>
            <a href='https://github.com/atish-57' target="_blank" rel="noopener noreferrer"><GitHubIcon className="icon" /></a>
            <a href="https://www.linkedin.com/in/atish-ranjan-3bab84251/" target="_blank" rel="noopener noreferrer"><LinkedInIcon className="icon" /></a>
            <FacebookIcon />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li onClick={() =>navigate("/")}>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+1-212-456-7890</li>
            <li>contact@tomato.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className='footer-copyright'>Copyright {year} © Tomato.com - All rights reserved.</p>
    </div>
  )
}

export default Footer