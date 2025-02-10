import React, { useContext, useEffect, useState } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import { database } from '../../config/firebase'
import { collection, getDocs } from 'firebase/firestore'

const FoodDisplay = ({ category }) => {
    const [products, setProducts] = useState([])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "Products"))
                const productsData = querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }))
                setProducts(productsData)
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchProducts()
    }, [])
    console.log(products)

    return (
        <div className='food-display' id='food-display'>
            <h2 className='h2we'>Top dishes near you</h2>
            <div className="food-display-list">
                {products.map((item, index) => {
                    if (category === "All" || category === item.category) {
                        return <FoodItem key={index} id={item._id} name={item.prodName} description={item.description} price={item.price} image={item.imageLink} />
                    }
                })}
            </div>
        </div>
    )
}

export default FoodDisplay