import React, { useEffect, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut,
  signInWithRedirect
} from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { use } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDocRef = doc(database, 'Users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName,
                    email: user.email,
                    createdAt: new Date()
                });
            }
            toast.success('Successfully logged in with Google!');
            setShowLogin(false);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError(err.message);
            toast.error(err.message);
        }
    };

    const onLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (currState === "Login") {
            signInWithEmailAndPassword(auth, data.email, data.password)
                .then(async (response) => {
                    await response.user.reload();
                    if (response.user.emailVerified) {
                        toast.success('Successfully logged in!');
                        setShowLogin(false);
                    } else {
                        toast.error("Please verify your email before logging in.");
                        await signOut(auth);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    toast.error("Invalid email or password");
                });
        } else {
            if (data.password.length < 6) {
                setLoading(false);
                toast.error("Password should be at least 6 characters long");
                return;
            }

            createUserWithEmailAndPassword(auth, data.email, data.password)
                .then(async (response) => {
                    await sendEmailVerification(response.user);
                    
                    await setDoc(doc(database, 'Users', response.user.uid), {
                        name: data.name,
                        email: data.email,
                        createdAt: new Date()
                    });

                    toast.info("Verification email sent. Please verify your email and then login.");
                    setCurrState("Login");
                    await signOut(auth);
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    if (err.code === 'auth/email-already-in-use') {
                        toast.error("Email already in use");
                    } else if (err.code === 'auth/invalid-email') {
                        toast.error("Invalid email address");
                    } else {
                        toast.error(err.message);
                    }
                });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!data.email) {
            toast.error("Please enter your email address");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            await sendPasswordResetEmail(auth, data.email);
            toast.success("Password reset link sent to your email!");
        } catch (err) {
            toast.error("Invalid email address");
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
                    {currState === "Login" && (
                        <p className="forgot-password">
                            <span onClick={handleForgotPassword}>Forgot Password?</span>
                        </p>
                    )}
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
                {/* <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p className='continuee'>By continuing, I agree to the terms of use & privacy policy</p>
                </div> */}
                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
                }
            </form>
        </div>
    );
};

export default LoginPopup;
