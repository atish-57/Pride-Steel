import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Cart from './pages/cart/Cart'
import PlaceOrder from './Pages/PlaceOrder/PlaceOrder'
import Home from './Pages/Home/Home'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Navbar from './components/Navbar/Navbar.jsx'
import Verify from './Pages/Verify/Verify'
import MyOrders from './Pages/MyOrders/MyOrders'
import Product from './pages/Products/Products'
import { ToastContainer } from 'react-toastify'
import ProfilePage from './pages/Profile/ProfilePage'

const App = () => {

  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/products/:id' element={<Product />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>

  )
}

export default App

