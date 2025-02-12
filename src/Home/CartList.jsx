import { useEffect, useState } from 'react';
import axios from 'axios';
import './Food.css';

const tokenLine = '63ZCi6LuRy1vZL0dWmQs6DuESp6Jxdpg6j3lyUrOrCF';

export const notifyLine = async (message) => {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://notify-api.line.me/api/notify',
            headers: {
                'Content-Type': 'application/x-www-form-urlencodedORmultipart/form-data',
                'Authorization': 'Bearer ' + tokenLine
            },
            data: `message=${message}`,
        }); 
        console.log("notify response ", response);
    } catch (err) {
        console.error('Error sending notification:', err);
    }
};

function CartList({ cart }) {
    const [CART, setCART] = useState([]);

    useEffect(() => {
        setCART(cart)
    }, [cart])

    return (
        <>
            <div>
                {
                    CART?.map((cartItem, cartindex) => {
                        return (
                            <div key={cartindex} className='cartlist'>
                                <div className="cartimage">
                                    <img src={cartItem.url} width={200} alt={cartItem.name} />
                                </div>
                                <div className="cartname">
                                    <span> {cartItem.name}  </span>
                                    <button
                                        onClick={() => {
                                            const _CART = CART.map((item, index) => {
                                                return cartindex === index ? { ...item, quantity: item.quantity > 0 ? item.quantity - 1 : 0 } : item
                                            })
                                            setCART(_CART)
                                        }}
                                    >-</button>
                                    <span> {cartItem.quantity} </span>
                                    <button
                                        onClick={() => {
                                            const _CART = CART.map((item, index) => {
                                                return cartindex === index ? { ...item, quantity: item.quantity + 1 } : item
                                            })
                                            setCART(_CART)
                                        }}
                                    >+</button>
                                    <span>   ฿ {cartItem.price * cartItem.quantity.toLocaleString()}</span>
                                    <button
                                        onClick={() => {
                                            const stockLeft = cartItem.stock - cartItem.quantity;
                                            alert(`Stock left: ${stockLeft}`);
                                            const text = `Stock left for ${cartItem.name}: ${stockLeft}`;
                                            notifyLine(text);
                                        }}
                                    >Order</button>
                                </div>
                            </div>
                        )
                    })
                }
                <div className="total">
                    <p> Total amount :  <span>
                        {
                            CART.map(item => item.price * item.quantity).reduce((total, value) => total + value, 0)
                        }
                    </span></p>
                </div>
            </div>
        </>
    )
}

export default CartList;
