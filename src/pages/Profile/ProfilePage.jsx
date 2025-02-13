import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { BsCart3 } from "react-icons/bs";
import { auth, database } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ProfilePage.css";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc } from "firebase/firestore";

const ProfilePage = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  useEffect(() => {
    // Check if user is logged in and get their email and name
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        // Get display name from auth, fallback to email if name not available
        setUserName(user.displayName || user.email.split('@')[0]);
        setUserId(user.uid);

        // Fetch addresses when user is authenticated
        if (user.uid) {
          fetchAddresses(user.uid);
        }
      } else {
        // Redirect to login if no user is logged in
        navigate("/");
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  const fetchAddresses = async (uid) => {
    try {
      const userDoc = await getDoc(doc(database, 'Users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setAddresses(userData.addresses || []);
      }
    } catch (error) {
      toast.error("Error fetching addresses");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(database, 'Users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentAddresses = userDoc.data().addresses || [];
        const newAddressWithId = {
          ...newAddress,
          id: Date.now().toString(), // Generate a unique ID
          createdAt: new Date()
        };
        
        await updateDoc(userRef, {
          addresses: [...currentAddresses, newAddressWithId]
        });
        
        setAddresses([...currentAddresses, newAddressWithId]);
        setShowAddressForm(false);
        setNewAddress({ street: '', city: '', state: '', zipCode: '', isDefault: false });
        toast.success("Address added successfully");
      }
    } catch (error) {
      toast.error("Error adding address");
    }
  };

  const handleUpdateAddress = async (e, addressId) => {
    e.preventDefault();
    try {
      const userRef = doc(database, 'Users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentAddresses = userDoc.data().addresses || [];
        const updatedAddresses = currentAddresses.map(addr => 
          addr.id === addressId ? { ...editingAddress, id: addressId } : addr
        );
        
        await updateDoc(userRef, {
          addresses: updatedAddresses
        });
        
        setAddresses(updatedAddresses);
        setEditingAddress(null);
        toast.success("Address updated successfully");
      }
    } catch (error) {
      toast.error("Error updating address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const userRef = doc(database, 'Users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentAddresses = userDoc.data().addresses || [];
        const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
        
        await updateDoc(userRef, {
          addresses: updatedAddresses
        });
        
        setAddresses(updatedAddresses);
        toast.success("Address deleted successfully");
      }
    } catch (error) {
      toast.error("Error deleting address");
    }
  };

  const renderAddressContent = () => {
    return (
      <div className="address-management">
        <h2>My Addresses</h2>
        <button className="action-button" onClick={() => setShowAddressForm(true)}>
          Add New Address
        </button>

        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="address-form">
            <input
              type="text"
              placeholder="Street"
              value={newAddress.street}
              onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={newAddress.zipCode}
              onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
              />
              Set as default address
            </label>
            <button type="submit">Save Address</button>
            <button type="button" onClick={() => setShowAddressForm(false)}>Cancel</button>
          </form>
        )}

        <div className="addresses-list">
          {addresses.map((address) => (
            <div key={address.id} className="address-card">
              {editingAddress?.id === address.id ? (
                <form onSubmit={(e) => handleUpdateAddress(e, address.id)} className="address-form">
                  <input
                    type="text"
                    placeholder="Street"
                    value={editingAddress.street}
                    onChange={(e) => setEditingAddress({...editingAddress, street: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={editingAddress.city}
                    onChange={(e) => setEditingAddress({...editingAddress, city: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={editingAddress.state}
                    onChange={(e) => setEditingAddress({...editingAddress, state: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={editingAddress.zipCode}
                    onChange={(e) => setEditingAddress({...editingAddress, zipCode: e.target.value})}
                    required
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={editingAddress.isDefault}
                      onChange={(e) => setEditingAddress({...editingAddress, isDefault: e.target.checked})}
                    />
                    Set as default address
                  </label>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingAddress(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  {address.isDefault && <span className="default-badge">Default</span>}
                  <div className="address-actions">
                    <button onClick={() => setEditingAddress({...address})}>Edit</button>
                    <button onClick={() => handleDeleteAddress(address.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="profile-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M23.0335 3.74112C23.0675 3.61421 23.1261 3.49523 23.206 3.39099C23.286 3.28674 23.3857 3.19926 23.4994 3.13356C23.6132 3.06786 23.7388 3.02522 23.869 3.00807C23.9993 2.99092 24.1316 2.9996 24.2585 3.03362C26.246 3.56737 27.8835 4.79737 28.866 6.49987C28.9986 6.72962 29.0345 7.00263 28.9658 7.25885C28.8972 7.51507 28.7295 7.73351 28.4998 7.86612C28.27 7.99873 27.997 8.03464 27.7408 7.96596C27.4846 7.89727 27.2661 7.72962 27.1335 7.49987C26.4185 6.25987 25.2135 5.35987 23.741 4.96612C23.6141 4.93218 23.4951 4.87356 23.3909 4.79362C23.2866 4.71367 23.1992 4.61397 23.1335 4.50021C23.0677 4.38645 23.0251 4.26086 23.008 4.13061C22.9908 4.00036 22.9995 3.86801 23.0335 3.74112ZM9.94726 28.2149C8.77476 27.2899 7.79476 26.1099 6.86601 24.4999C6.80035 24.3861 6.71293 24.2864 6.60873 24.2064C6.50454 24.1265 6.38561 24.0678 6.25874 24.0338C6.13187 23.9998 5.99955 23.9911 5.86932 24.0082C5.7391 24.0254 5.61352 24.068 5.49976 24.1336C5.38601 24.1993 5.2863 24.2867 5.20632 24.3909C5.12635 24.4951 5.06769 24.614 5.03368 24.7409C4.99967 24.8678 4.99098 25.0001 5.00811 25.1303C5.02524 25.2605 5.06785 25.3861 5.13351 25.4999C6.19476 27.3374 7.32976 28.6986 8.70851 29.7849C8.91704 29.9453 9.18039 30.0171 9.44148 29.9847C9.70257 29.9523 9.94038 29.8183 10.1033 29.6117C10.2663 29.4052 10.3413 29.1427 10.3121 28.8813C10.2829 28.6198 10.1518 28.3804 9.94726 28.2149ZM24.5235 7.30237C24.394 7.07151 24.2199 6.86866 24.0114 6.70558C23.8029 6.5425 23.564 6.42244 23.3088 6.35236C23.0535 6.28228 22.7868 6.26357 22.5243 6.29733C22.2617 6.33108 22.0085 6.41663 21.7792 6.549C21.55 6.68137 21.3493 6.85793 21.1888 7.06845C21.0283 7.27897 20.9112 7.51926 20.8443 7.77538C20.7773 8.0315 20.7619 8.29836 20.7989 8.56048C20.8359 8.8226 20.9246 9.07477 21.0598 9.30237L23.0598 12.7661C23.1254 12.8799 23.1681 13.0055 23.1852 13.1357C23.2024 13.2659 23.1937 13.3982 23.1597 13.5251C23.1257 13.652 23.067 13.7709 22.987 13.8751C22.907 13.9793 22.8073 14.0667 22.6935 14.1324C21.7749 14.6629 21.1047 15.5365 20.8302 16.5611C20.5557 17.5858 20.6994 18.6775 21.2298 19.5961C21.3624 19.8259 21.3983 20.0989 21.3296 20.3551C21.2609 20.6113 21.0933 20.8298 20.8635 20.9624C20.6338 21.095 20.3608 21.1309 20.1045 21.0622C19.8483 20.9935 19.6299 20.8259 19.4973 20.5961C18.79 19.3672 18.54 17.9278 18.7917 16.5324C19.0433 15.137 19.7803 13.8756 20.8723 12.9711L15.8285 4.23987C15.5633 3.78039 15.1264 3.44507 14.614 3.3077C14.1015 3.17033 13.5555 3.24216 13.096 3.50737C12.6365 3.77259 12.3012 4.20947 12.1638 4.72192C12.0265 5.23436 12.0983 5.78039 12.3635 6.23987L16.3635 13.1686C16.4879 13.3977 16.5179 13.6663 16.4472 13.9171C16.3765 14.168 16.2106 14.3814 15.9849 14.5117C15.7592 14.6421 15.4915 14.6792 15.2388 14.6151C14.9862 14.551 14.7685 14.3908 14.6323 14.1686L9.63226 5.50737C9.36705 5.04789 8.93016 4.71257 8.41772 4.5752C7.90528 4.43783 7.35925 4.50966 6.89976 4.77487C6.44028 5.04009 6.10497 5.47697 5.96759 5.98942C5.83022 6.50186 5.90205 7.04789 6.16726 7.50737L11.6673 17.0336C11.7371 17.1475 11.7834 17.2741 11.8035 17.4061C11.8235 17.5382 11.8169 17.6729 11.7841 17.8023C11.7513 17.9317 11.6928 18.0533 11.6123 18.1598C11.5317 18.2663 11.4306 18.3556 11.315 18.4223C11.1993 18.4891 11.0715 18.5321 10.939 18.5487C10.8065 18.5653 10.672 18.5551 10.5435 18.5189C10.415 18.4827 10.295 18.4211 10.1907 18.3377C10.0863 18.2544 9.99974 18.151 9.93601 18.0336L6.43601 11.9724C6.30469 11.7449 6.12984 11.5454 5.92145 11.3855C5.71306 11.2256 5.47521 11.1082 5.22147 11.0402C4.96773 10.9722 4.70309 10.9548 4.44263 10.9891C4.18218 11.0233 3.93103 11.1086 3.70351 11.2399C3.476 11.3712 3.27658 11.546 3.11664 11.7544C2.95669 11.9628 2.83936 12.2007 2.77134 12.4544C2.70333 12.7082 2.68595 12.9728 2.72021 13.2333C2.75447 13.4937 2.83969 13.7449 2.97101 13.9724L8.47101 23.4986C9.93308 26.0185 12.335 27.8554 15.1499 28.6064C17.9647 29.3573 20.9625 28.961 23.4854 27.5044C26.0084 26.0477 27.8505 23.6497 28.6075 20.8365C29.3646 18.0233 28.9747 15.0247 27.5235 12.4986L24.5235 7.30237Z" fill="black"></path>
    </svg>
          <h1>Hello, {userName}</h1>
        </div>
        <div className="sidebar-menu">
          <h2>Account Overview</h2>
          <ul>
            <li onClick={() => setCurrentView('addresses')}>Address</li>
            <li>Manage Orders</li>
          </ul>
          <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            <BiLogOut /> Log out
          </button>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {currentView === 'overview' ? (
          <div className="cards-grid">
            {/* Personal Info Card */}
            <div className="card">
              <div className="card-header">
                <FaUser className="card-icon" />
                <h2>Personal Info</h2>
                
              </div>
              <div className="card-content">
                <p>Email: {userEmail}</p>
              </div>
              {/* <div>
                <button className="action-button">Edit Info</button>
                </div> */}
                {/* You can add phone number here if you have it in your user data */}
            </div>

            {/* Address Book Card */}
            <div className="card">
              <div className="card-header">
                {/* <img src="/address-icon.png" alt="Address" className="card-icon" /> */}
                <h2>Address Book</h2>
              </div>
              <p className="card-description">
                Checkout faster with your saved addresses
              </p>
              <button className="action-button">Shipping Address</button>
            </div>

            {/* Manage Orders Card */}
            <div className="card">
              <div className="card-header">
                <BsCart3 className="card-icon" />
                <h2>Manage Orders</h2>
              </div>
              <p className="card-description">Your online orders</p>
              <button className="action-button">View Orders</button>
            </div>
          </div>
        ) : currentView === 'addresses' ? (
          renderAddressContent()
        ) : null}
      </div>
    </div>
  );
};

export default ProfilePage;