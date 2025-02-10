import React, { useEffect, useState } from 'react'
import './ExploreMenu.css'
import { database } from '../../config/firebase'
import { collection, getDocs } from 'firebase/firestore'

const ExploreMenu = ({ category, setCategory }) => {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "Category"))
                const categoryData = querySnapshot.docs.map(doc => ({
                    menu_name: doc.data().name,
                    menu_image: doc.data().image
                }))
                setCategories(categoryData)
            } catch (error) {
                console.error("Error fetching categories:", error)
            }
        }
        fetchCategories()
    }, [])
    console.log(categories)

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore our menu</h1>
            <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes.</p>
            <div className="explore-menu-list">
                {categories.map((item, index) => {
                    return (
                        <div onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} key={index} className='explore-menu-list-item'>
                            <img className={category === item.menu_name ? "active" : ""} src={item.menu_image}></img>
                            <p>{item.menu_name}</p>
                        </div>
                    )
                })}
            </div>
            <hr />
        </div>
    )
}

export default ExploreMenu