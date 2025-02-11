import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { database, auth } from '../../config/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Products.css';
import { Category } from '@mui/icons-material';

const Product = () => {
  const { id } = useParams();
  const [productsData, setProductsData] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedGauge, setSelectedGauge] = useState('22G');
  const [price, setPrice] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 
  const fetchProductsData = async () => {
    try {
      const docRef = doc(database, "Products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProductsData({
          _id: docSnap.id,
          ...data
        });
        setSelectedSize(data.size[0]);
        setSelectedMaterial(Object.keys(data.material)[0]);
        setSelectedImage(data.imageLink[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, [id]);

  useEffect(() => {
    if (productsData && selectedSize && selectedMaterial) {
      const materialPrices = productsData.material[selectedMaterial];
      setPrice(materialPrices[selectedGauge]);
    }
  }, [productsData, selectedSize, selectedMaterial, selectedGauge]);

  const handleQuantityChange = (change) => {
    setQuantity(change >= 1 ? change : 1);
  };

  const addToCart = async (productId) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error('Please login to add items to cart');
        return;
      }

      const cartItem = {
        productId,
        prodName: productsData.prodName,
        size: selectedSize,
        material: selectedMaterial,
        gauge: selectedGauge,
        price: price,
        imageUrl: selectedImage,
        quantity: quantity,
        category: productsData.category
      };

      const userDocRef = doc(database, "Users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingCartData = userData.cartData || [];

        // Check if item already exists with same properties
        const existingItemIndex = existingCartData.findIndex(item =>
          item.productId === productId &&
          item.size === selectedSize &&
          item.material === selectedMaterial &&
          item.gauge === selectedGauge
        );

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          const updatedCartData = [...existingCartData];
          updatedCartData[existingItemIndex].quantity = quantity;

          await updateDoc(userDocRef, {
            cartData: updatedCartData
          });
        } else {
          // Add new item
          await updateDoc(userDocRef, {
            cartData: arrayUnion(cartItem)
          });
        }
      } else {
        // Create new document
        await setDoc(userDocRef, {
          cartData: [cartItem]
        });
      }

      toast.success('Product added to cart successfully!');
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error('Failed to add product to cart');
    }
  };

  return productsData ? (
    <div className="product-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="product-main">
        <div className="product-images">
          <div className="image-layout">
            <div className="thumbnail-container">
              {productsData.imageLink.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`product-${index + 1}`}
                  onClick={() => setSelectedImage(image)}
                  className="thumbnail-image"
                />
              ))}
            </div>

            <div className="main-image-container">
              <img
                src={selectedImage}
                alt="product"
                className="main-image"
              />
            </div>
          </div>
        </div>

        <div className="product-details">
          <h1 className="product-title">{productsData.prodName}</h1>

          <div className="ratings">
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_dull_icon} alt="" className="star-icon" />
          </div>

          <div className="product-options">
            <div className="size-selector">
              <label>Size:</label>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                {productsData.size.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="material-selector">
              <label>Material:</label>
              <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
                {Object.keys(productsData.material).map((material) => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>

            <div className="gauge-selector">
              <label>Gauge:</label>
              <select value={selectedGauge} onChange={(e) => setSelectedGauge(e.target.value)}>
                <option value="20G">20G</option>
                <option value="22G">22G</option>
              </select>
            </div>
            

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <p className="product-price">
            ₹{price} <span className="price-unit">/kg</span>
          </p>
          <p className="product-description">{productsData.description}</p>

          <button
            onClick={() => addToCart(productsData._id)}
            className="add-to-cart-btn"
          >
            ADD TO CART
          </button>

          <hr className="divider" />

          <div className="product-features">
            {/* <p>100% Original product </p> */}
            <p>Sample info</p>
            {/* <p>Free delivery on order above ₹499</p>
            <p>Easy return and exchange policy within 7 days</p> */}
          </div>
        </div>
      </div>

      <div className="description-section">
        <div className="tab-buttons">
          <b className="tab-button">Description</b>
        </div>

        <div className="tab-content">
          <p>
            {productsData.Description}
          </p>
          {/* <p>
            E-commerce websites typically display products or services along
            with detailed descriptions, images, prices, and any ovalable
            variations (eg, sizes colors). Each product uwaly has its ww
            dedicated page with relevant infurroution
          </p> */}
        </div>
      </div>
    </div>
  ) : (
    <div className="empty-state">Loading...</div>
  );
};

export default Product;