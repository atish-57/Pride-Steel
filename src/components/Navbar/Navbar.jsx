import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState("home");
    const { totoalAmoutCartAmount, token, setToken } = useContext(StoreContext)

    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem("token")
        setToken("")
        navigate("/")
    }


    return (
        <div className='navbar'>
            <Link to='/'><img src={assets.logo} alt="logo" className='logo' /></Link>
            <ul className="navbar-menu">
                <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
                <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</a>
                <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</a>
                <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>contact us</a>
            </ul>
            <div className="navbar-right">
                <img src={assets.search_icon} alt="search icon"></img>
                <div className="navbar-search-icon">
                    <Link to='/cart' ><img src={assets.basket_icon} alt="basket icon" /></Link>
                    <div className={totoalAmoutCartAmount() === 0 ? "" : "dot"}></div>
                </div>
                {!token ? <button onClick={() => setShowLogin(true)}>Sign in</button> :
                    <div className='navbar-profile'>
                        <img src={assets.profile_icon} alt=""></img>
                        <ul className='nav-profile-dropdown'>
                            <li onClick={() => navigate("/myorders")} ><img src={assets.bag_icon} alt=""></img><p>Orders</p></li>
                            <hr></hr>
                            <li onClick={logout}><img src={assets.logout_icon} alt=""></img><p>Logut</p></li>
                        </ul>

                    </div>}

            </div>
        </div>
    );
}

export default Navbar;