import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../../config/firebase';

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Login");
    const { url, token, setToken } = useContext(StoreContext);

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const onLogin = async (event) => {
        event.preventDefault();


        setLoading(true);
        setError(null);

        let newUrl = url;
        if (currState === "Login") {
            newUrl += "/api/user/login";
        } else {
            newUrl += "/api/user/register";
        }

        try {
            const response = await axios.post(newUrl, data);
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setShowLogin(false);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(response.data.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-popup'>
            <form className="login-popup-container" onSubmit={onLogin}>
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" && (
                        <input
                            onChange={onChangeHandler}
                            name="name"
                            value={data.name}
                            type="text"
                            placeholder='Your name'
                            required
                        />
                    )}
                    <input
                        onChange={onChangeHandler}
                        name="email"
                        value={data.email}
                        type="email"
                        placeholder='Your email'
                        required
                    />
                    <input
                        onChange={onChangeHandler}
                        name="password"
                        value={data.password}
                        type="password"
                        placeholder='Password'
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Processing..." : currState === "Sign Up" ? "Create account" : "Login"}
                </button>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p className='continuee'>By continuing, I agree to the terms of use & privacy policy</p>
                </div>
                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
                }
            </form>
        </div>
    );
}

export default LoginPopup;

