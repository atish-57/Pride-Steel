import React from 'react'
import './Cart.css'
import { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import truck_free from '../../assets/truck_free.png'
import emptycart  from '../../assets/emptycart.png'
import { assets,  food_list } from '../../assets/assets'
import { database, auth } from '../../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const ExpandIcon = ({ expanded }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="#1C1C1C" 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <path d="M4.48 7.38c0.28-0.28 0.76-0.28 1.060 0l4.46 4.48 4.48-4.48c0.28-0.28 0.76-0.28 1.060 0s0.28 0.78 0 1.060l-5 5c-0.3 0.3-0.78 0.3-1.060 0l-5-5c-0.3-0.28-0.3-0.76 0-1.060z" />
  </svg>
);

const Cart = () => {
  const { totoalAmoutCartAmount } = useContext(StoreContext)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState({})
  
  const navigate = useNavigate()

  // Group cart items by category
  const groupedCartItems = cartItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Handle quantity change
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 0) return

    try {
      const userId = auth.currentUser?.uid
      if (!userId) return

      const userDocRef = doc(database, 'Users', userId)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        let updatedCartData
        
        if (newQuantity === 0) {
          // Remove the item if quantity is 0
          updatedCartData = userData.cartData.filter(cartItem => 
            !(cartItem.productId === item.productId && 
              cartItem.size === item.size && 
              cartItem.material === item.material && 
              cartItem.gauge === item.gauge)
          )
        } else {
          // Update quantity if greater than 0
          updatedCartData = userData.cartData.map(cartItem => {
            if (cartItem.productId === item.productId && 
                cartItem.size === item.size && 
                cartItem.material === item.material && 
                cartItem.gauge === item.gauge) {
              return { ...cartItem, quantity: newQuantity }
            }
            return cartItem
          })
        }

        await updateDoc(userDocRef, {
          cartData: updatedCartData
        })

        setCartItems(updatedCartData)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(database, 'Users', user.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            const cartData = userData.cartData || []
            setCartItems(cartData)
            
            // Initialize all categories as expanded
            const categories = cartData.reduce((acc, item) => {
              acc[item.category] = true;
              return acc;
            }, {});
            setExpandedCategories(categories);
          }
        } catch (error) {
          console.error('Error fetching cart data:', error)
        }
      } else {
        setCartItems([])
        setExpandedCategories({})
      }
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, []) // Remove navigate from dependencies

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <img src={emptycart} alt="Empty Cart" />
        <h2>Your cart is empty!</h2>
        <button className="start-shopping-btn" onClick={() => navigate('/')}>
          Start Shopping
        </button>
      </div>
    )
  }

  return (
    <div className='cart-container'>
      <div className='cart-main'>
        <div className="cart-header">
          <h2>{cartItems.length} items in cart</h2>
        </div>

        <div className="cart-items">
          {Object.entries(groupedCartItems).map(([category, items]) => (
            <div className="cart-category" key={category}>
              <div 
                className="category-header" 
                onClick={() => toggleCategory(category)}
              >
                <h3 className='cart-category-title'>{category} ({items.length})</h3>
                <ExpandIcon expanded={expandedCategories[category]} />
              </div>
              {expandedCategories[category] && items.map((item, index) => (
                <div className="cart-product" key={index}>
                  <img src={item.imageUrl} alt={item.prodName} />
                  <div className="product-details">
                    <h4>{item.prodName}</h4>
                    <p className="specs">
                      {item.material && <span>Material: {item.material}, </span>}
                      {item.size && <span>Size: {item.size}</span>}
                      {item.gauge && <span>, Gauge: {item.gauge}</span>}
                    </p>
                    <div className="price-row">
                      <p className="price">₹{item.price}</p>
                      {item.savings && (
                        <p className="savings">Savings ₹{item.savings}</p>
                      )}
                    </div>
                  </div>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="cart-summary">
        <div className="savings-banner">
          <img src={assets.discount_icon} alt="discount" />
          <p>Saving ₹498 on this order</p>
        </div>
        
        <div className="summary-details">
          <div className="summary-row">
            <span>Item total</span>
            <span>₹{calculateTotal()}</span>
          </div>
          <div className="summary-row discount">
            <span>Product discount</span>
            <span>-₹498.14</span>
          </div>
          <div className="summary-row">
            <span>GST + Cess</span>
            <span>₹83.43</span>
          </div>
          <div className="summary-row">
            <span>Delivery charge</span>
            <span className="free">
              <img src={truck_free} alt="Free delivery" className="delivery-icon" />
              FREE
            </span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{calculateTotal() - 498.14 + 83.43}</span>
          </div>
        </div>
        <button className="checkout-btn" onClick={() => navigate('/order')}>
          Checkout
        </button>
      </div>
    </div>
  )
}

export default Cart