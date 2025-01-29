import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/userOrder`,
        {},
        { headers: { token } }
      );
      if (response.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
      } else {
        setData([]);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='my-orders'>
      <h2 className='myordersp'>My Orders</h2>
      <div className='container'>
        {data.length > 0 ? (
          data.map((order, index) => (
            <div key={index} className='my-orders-order'>
              <img src={assets.parcel_icon} alt='Parcel Icon' />
              <p>
                {order.items ? (
                  order.items.map((item, itemIndex) =>
                    itemIndex === order.items.length - 1
                      ? `${item.name} x ${item.quantity}`
                      : `${item.name} x ${item.quantity}, `
                  )
                ) : (
                  <span>No items</span>
                )}
              </p>
              <p>${order.amount}.00</p>
              <p>Items: {order.items ? order.items.length : 0}</p>
              <p>
                <span>&#x25cf;</span> <b>{order.status}</b>
              </p>
              <button onClick={fetchOrders}>Track Order</button>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default MyOrders;