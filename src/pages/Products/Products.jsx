import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assets, food_list } from '../../assets/assets'
import './Products.css';
const Product = () => {
  const { id } = useParams();
  const [productsData, setProductsData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductsData = async () => {
    food_list.map((product) => {
      if (product._id === id) {
        setProductsData(product);
        setImage(product.image);
        return null;
      }
    });
  };
  

  useEffect(() => {
    fetchProductsData();
  }, [id, food_list]);

  return productsData ? (
    <div className="product-container">
      <div className="product-main">
        <div className="product-images">
          <div className="main-image-container">
            <img
              src={image}
              alt="product"
              className="main-image"
            />
          </div>
        </div>

        <div className="product-details">
          <h1 className="product-title">{productsData.name}</h1>

          <div className="ratings">
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_icon} alt="" className="star-icon" />
            <img src={assets.star_dull_icon} alt="" className="star-icon" />
            <p className="rating-count">(122)</p>
          </div>

          <p className="product-price">{productsData.price}</p>
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
            with defailed descriptions, images, prices, and any ovalable
            variations (eg, sizes colors). Each product uwaly has its ww
            dedicated page with relevant infurroution
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="empty-state"></div>
  );
};

export default Product;