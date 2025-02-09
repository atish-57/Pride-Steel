import React, { useEffect, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendEmailVerification, 
  signOut 
} from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { use } from 'react';

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Login");
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

    const fetchProducts = async () => {
        try {
            const productsCollection = collection(database, 'Products');
            const productsSnapshot = await getDocs(productsCollection);
            const productsList = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Access the value for plain 22G
            const plain22GValue = productsList[0].materials.plain.gauge['22G'];
            console.log('Plain 22G value:', plain22GValue); // Should output: "250"
            
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user.emailVerified) {
                setShowLogin(false);
            } else {
                setError("Please verify your email before logging in.");
                await signOut(auth);
            }

            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError(err.message);
        }
    };

    const onLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (currState === "Login") {
            signInWithEmailAndPassword(auth, data.email, data.password)
                .then(async (response) => {
                    if (response.user.emailVerified) {
                        console.log('Logged in:', response.user);
                        await fetchProducts();
                        setShowLogin(false);
                    } else {
                        setError("Please verify your email before logging in.");
                        signOut(auth);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    setError(err.message);
                });
        } else {
            createUserWithEmailAndPassword(auth, data.email, data.password)
                .then(async (response) => {
                    console.log('User created:', response.user);

                    await sendEmailVerification(response.user);
                    setError("Verification email sent. Please verify your email before logging in.");

                    await signOut(auth);
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    setError(err.message);
                });
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
                <button 
                    type="button" 
                    className="google-signin-btn" 
                    onClick={handleGoogleSignIn} 
                    disabled={loading}
                >
                    Continue with Google
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
};

export default LoginPopup;
