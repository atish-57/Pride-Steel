import axios from "axios";
import React, { createContext, useEffect, useState } from "react";


export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    // add backend url 
    const url = ""
    const [cartItem, SetCartItem] = useState({});
    const [token, setToken] = useState("");

    const [food_list, setFood_list] = useState([]);


    const addToCart = async (itemId) => {
        if (!cartItem[itemId]) {
            SetCartItem((prev) => ({ ...prev, [itemId]: 1 }))
        }
        else {
            SetCartItem((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
        if (token) {
            await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } })

        }
    }

    const loadCartData = async (token) => {
        const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } })
        SetCartItem(response.data.cartData)
    }
    const removeFromCart = async (itemId) => {
        SetCartItem((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (token) {
            await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } })
        }
    }

    const totoalAmoutCartAmount = () => {
        let amountTotal = 5;
        // for (const item in cartItem) {
        //     if (cartItem[item] > 0) {
        //         let itemInfo = food_list.find((product) => product._id === item);
        //         amountTotal += itemInfo.price * cartItem[item];
        //     }
        // }
        return amountTotal;
    }

    const fetchFoodList = async () => {
        const response = await axios.get(`${url}/api/food/list`)
        setFood_list(response.data.data)
    }
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"));
            }
        }
        loadData();
    }, [])

    const contextValue = {
        food_list,
        cartItem,
        SetCartItem,
        addToCart,
        removeFromCart,
        totoalAmoutCartAmount,
        url,
        token,
        setToken,

    };



    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
