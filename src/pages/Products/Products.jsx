import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { database } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Products.css';

const Product = () => {
  const { id } = useParams();
  const [productsData, setProductsData] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedGauge, setSelectedGauge] = useState('22G');
  const [price, setPrice] = useState('');

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

  return productsData ? (
    <div className="product-container">
      <div className="product-main">
        <div className="product-images">
          <div className="main-image-container">
            <img
              src={productsData.imageLink}
              alt="product"
              className="main-image"
            />
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
            <p className="rating-count">(122)</p>
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
          </div>

          <p className="product-price">₹{price}</p>
          <p className="product-description">{productsData.description}</p>

          <button
            onClick={() => addToCart(productsData._id)}
            className="add-to-cart-btn"
          >
            ADD TO CART
          </button>

          <hr className="divider" />

          <div className="product-features">
            <p>100% Original product </p>
            <p>Free delivery on order above ₹499</p>
            <p>Easy return and exchange policy within 7 days</p>
          </div>
        </div>
      </div>

      <div className="description-section">
        <div className="tab-buttons">
          <b className="tab-button">Description</b>
          <p className="tab-button">Reviews (122)</p>
        </div>

        <div className="tab-content">
          <p>
            Ane-commerce website is an online platform that facilitates the
            buying and selling of products or services over the internet. It
            serves as a vietual marketplace where businesses and individuals.com
            showcase ther produch, interact with customers, and conduct
            fransactions without the need for a physical presence. E-commerce
            websites have goned immense popularity due to their convenience,
            accessibility, and the global reach they offer.
          </p>
          <p>
            E-commerce websites typically display products or services along
            with detailed descriptions, images, prices, and any ovalable
            variations (eg, sizes colors). Each product uwaly has its ww
            dedicated page with relevant infurroution
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="empty-state">Loading...</div>
  );
};

export default Product;