import React from 'react';
import "./Food.css";
import Header from './Header';
import ProductList from './ProductList';
import CartList from './CartList';
import { useState } from 'react';

function Shop() {
  const [product, setProduct] = useState([
    {
      url: 'src/assets/istockphoto-619628284-612x612.jpg',
      name: 'Green curry',
      category: 'แกงเขียวหวาน',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-622440262-612x612.jpg',
      name: 'Panang',
      category: 'แพนง',
      price: 60
      
    },
    {
      url: 'src/assets/istockphoto-1215468752-612x612.jpg',
      name: 'Khoa soi',
      category: 'ข้าวซอยไก่',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-596799642-612x612.jpg',
      name: 'Pad Tai',
      category: 'ผัดไทย',
      price: 60
    },
    {
      url: 'src/assets/ต้มยำกุ้ง.jpg',
      name: 'Tom Yum Goong',
      category: 'ต้มยำกุ้ง',
      stock: 10,
      price: 60
    },
    {
      url: 'src/assets/ผัดเส้นก๋วยเตี๋ยว.jpg',
      name: 'Fried Noodle',
      category: 'ผัดเส้นก๋วยเตี๋ยว',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-1346102655-612x612.jpg',
      name: 'Hormokok ',
      category: 'ข้าวห่อหมก',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-1404484239-612x612.jpg',
      name: 'Fired Basil',
      category: 'ผัดกะเพรา',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-1326954341-612x612.jpg',
      name: 'Fish 1',
      category: 'ปลากระพงนึ่ง',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-1316574827-612x612.jpg',
      name: 'Spring Roll',
      category: 'ปอเปี๊ยะ',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-874010716-612x612.jpg',
      name: 'Orange Curry',
      category: 'แกงส้มชะอมกุ้ง',
      price: 60
    },
    {
      url: 'src/assets/istockphoto-538570874-612x612.jpg',
      name: 'Tom Yum Sea',
      category: 'ต้มยำน้ำข้นทะเล',
      price: 60
    },

  ])
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (data) => {
    // Format price with commas
    const formattedPrice = data.price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });

    const updatedData = { ...data, quantity: 1, formattedPrice };
    setCart([...cart, updatedData]);
  };

  const handleShow = (value) => {
    setShowCart(value);
  };

  return (
    <>
      <div>
        <Header count={cart.length} handleShow={handleShow}></Header>

        {
        showCart ?
          <CartList cart={cart} ></CartList> :
          <ProductList product={product} addToCart={addToCart} ></ProductList>
      }



      </div>
    </>
  );
}

export default Shop