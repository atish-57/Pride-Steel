import React, { useEffect, useState } from 'react';
import './PlaceOrder.css';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const naviagte = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { totoalAmoutCartAmount, token, food_list, cartItem, url } = useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };


  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItem[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItem[item._id] };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: totoalAmoutCartAmount() + 2,
    };

    if (paymentMethod === "card") {
      try {

        const response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
        if (response.data.success) {
          const { session_url } = response.data;
          window.location.replace(session_url);
        } else {
          alert("Error");
        }
      } catch (error) {
        console.error("Error placing order:", error);
        alert("Error");
      }
    }
    else {
      try {
        const response = await axios.post(`${url}/api/order/cod`, orderData, { headers: { token } });
        if (response.data.success) {
          naviagte("/myorders");
        } else {
          alert("Error");
        }
      } catch (error) {
        console.error("Error placing order:", error);
        alert("Error");
      }
    }
  };

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!token || totoalAmoutCartAmount() === 0) {
  //     navigate("/cart");
  //   }
  // }, [token, totoalAmoutCartAmount, navigate]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name='firstName'
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder='First Name'
          />
          <input
            required
            name='lastName'
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder='Last Name'
          />
        </div>
        <input
          className='emaill'
          required
          name='email'
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder='Email address'
        />
        <input
          className='streett'
          required
          name='street'
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder='Street'
        />
        <div className="multi-fields">
          <input
            required
            name='city'
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder='City'
          />
          <input
            required
            name='state'
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder='State'
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name='zipcode'
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder='Zip code'
          />
          <input
            required
            name='country'
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder='Country'
          />
        </div>
        <input
          className='phonee'
          required
          name='phone'
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder='Phone'
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${totoalAmoutCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${totoalAmoutCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${totoalAmoutCartAmount() === 0 ? 0 : totoalAmoutCartAmount() + 2}</b>
            </div>
          </div>

          <div className="payment-method">
            <p>Select Payment Method</p>
            <label>
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={handlePaymentMethodChange}
              />
              <div className="custom-radio"></div>
              <span>Cash on Delivery</span>
            </label>
            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={handlePaymentMethodChange}
              />
              <div className="custom-radio"></div>
              <span>Payment through Card</span>
            </label>
          </div>

          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;