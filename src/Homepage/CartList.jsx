import { useEffect, useState } from 'react';
import './Shop.css';

function CartList({ cart }) {

    const [CART, setCART] = useState([])

    useEffect(() => {
        setCART(cart)
    }, [cart])

    return (
        <>
         <div>
            {
                CART?.map((cartItem, cartindex) => {
                    return (
                        <>
                            <div className='cartlist'>
                                <div className="cartimage">
                                     <img src={cartItem.url} width={200} />
                                </div>
                            <div className="cartname"><span> {cartItem.name}  </span>
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
                                            alert(`Stock left: ${cartItem.stock - cartItem.quantity}`);
                                        }}
                                    >Buy</button>
                            </div>
                        </div>
                        </>
                        
                    )
                })
            }
            <div className="total">
            <p> Total amount :  <span></span>
                {
                    CART.map(item => item.price * item.quantity).reduce((total, value) => total + value, 0)
                }
            </p>
            </div>

        </div ></>
       
    )
}

export default CartList