import React, { useContext, useState } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext';
const FoodItem = ({ id, image, description, price, name }) => {


  const { cartItem, addToCart, removeFromCart } = useContext(StoreContext);

  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={image} alt=""></img>
        {!cartItem[id]
          ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white}></img>
          : <div className='food-item-counter'>
            <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt=" "></img>
            <p>{cartItem[id]}</p>
            <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt=" "></img>
          </div>
        }
      </div>
      <div className='food-item-info'>
        <div className='food-item-name-rating'>
          <p>{name}</p>
          <img src={assets.rating_starts}></img>
        </div>
        <p className='food-item-desc'>{description}</p>
        <p className='food-item-price'>${price}</p>

      </div>



    </div>
  )
}

export default FoodItem