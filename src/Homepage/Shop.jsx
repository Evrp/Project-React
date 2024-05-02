import React from 'react';
import "./Shop.css";
import Header from './Header';
import ProductList from './ProductList';
import CartList from './CartList';
import { useState } from 'react';

function Shop() {
  const [product, setProduct] = useState([
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/0f8b0d10-a51f-4c40-b5de-953012998b19/%E0%B8%A3%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%97%E0%B9%89%E0%B8%B2%E0%B8%9C%E0%B8%B9%E0%B9%89-dunk-low-W544sp.png',
      name: 'Nike Dunk Low Retro',
      stock: 10,
      category: 'Shoes',
      price: 5200
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/6b902d4d-e794-450c-9c34-c225b0f889bc/%E0%B8%A3%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%97%E0%B9%89%E0%B8%B2-v2k-run-zJV8TV.png',
      name: 'Nike V2K Run',
      category: 'Shoes',
      stock: 10,
      price: 4700
      
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/32b0f17a-38ba-40fa-9de7-31c5bb1661e3/%E0%B8%A3%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%97%E0%B9%89%E0%B8%B2%E0%B8%9C%E0%B8%B9%E0%B9%89-air-jordan-1-low-6Q1tFM.png',
      name: 'Air Jordan 1 Low',
      category: 'Shoes',
      stock: 10,
      price: 4300
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/383b23e4-6432-40a3-87f8-b0652c575ab3/%E0%B9%80%E0%B8%AA%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%A2%E0%B8%B7%E0%B8%94%E0%B8%9C%E0%B8%B9%E0%B9%89-sportswear-club-K8nM0q.png',
      name: 'Nike Sportwear Club',
      category: 'T-Shirt',
      stock: 10,
      price: 860
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ca57d020-dc7e-40bd-9292-9b4772031ffc/%E0%B9%80%E0%B8%AA%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%81%E0%B8%88%E0%B9%87%E0%B8%84%E0%B9%80%E0%B8%81%E0%B9%87%E0%B8%95-statet-%E0%B8%9C%E0%B8%B9%E0%B9%89-jordan-flight-mvp-mXSBxv.png',
      name: 'Jordan Flight MVP',
      category: 'T-Shirt',
      stock: 10,
      price: 3700
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/e0c7c591-2347-44fe-ac38-361330290d0e/%E0%B9%80%E0%B8%AA%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%81%E0%B8%82%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B9%89%E0%B8%99%E0%B8%AD%E0%B9%80%E0%B8%99%E0%B8%81%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%9C%E0%B8%B9%E0%B9%89-dri-fit-uv-hyverse-m7bctX.png',
      name: 'Nike Hyverse',
      category: 'T-Shirt',
      stock: 10,
      price: 1300
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3e837787-98fe-4a8f-99b2-5895c3dbd47c/%E0%B8%81%E0%B8%B2%E0%B8%87%E0%B9%80%E0%B8%81%E0%B8%87%E0%B8%82%E0%B8%B2%E0%B8%AA%E0%B8%B1%E0%B9%89%E0%B8%99%E0%B8%9C%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%9F%E0%B8%A3%E0%B8%99%E0%B8%8A%E0%B9%8C%E0%B9%80%E0%B8%97%E0%B8%A3%E0%B8%B5%E0%B8%9C%E0%B8%B9%E0%B9%89-club-alumni-brQr5q.png',
      name: 'Nike Club Alummi',
      category: 'Shorts',
      stock: 10,
      price: 2300
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/1eace967-9bc1-43fe-bb32-5c75f9ced5b9/%E0%B8%81%E0%B8%B2%E0%B8%87%E0%B9%80%E0%B8%81%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%A3%E0%B8%99%E0%B8%99%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%82%E0%B8%B2%E0%B8%A2%E0%B8%B2%E0%B8%A7%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%82%E0%B8%B2%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%A7%E0%B8%9C%E0%B8%B9%E0%B9%89-dri-fit-0ZBRN9.png',
      name: 'Nike Dri-Fit',
      category: 'trousers',
      stock: 10,
      price: 1900
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3e837787-98fe-4a8f-99b2-5895c3dbd47c/%E0%B8%81%E0%B8%B2%E0%B8%87%E0%B9%80%E0%B8%81%E0%B8%87%E0%B8%82%E0%B8%B2%E0%B8%AA%E0%B8%B1%E0%B9%89%E0%B8%99%E0%B8%9C%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%9F%E0%B8%A3%E0%B8%99%E0%B8%8A%E0%B9%8C%E0%B9%80%E0%B8%97%E0%B8%A3%E0%B8%B5%E0%B8%9C%E0%B8%B9%E0%B9%89-club-alumni-brQr5q.png',
      name: 'Nike Club Alummi',
      category: 'Shorts',
      stock: 10,
      price: 2300
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3e837787-98fe-4a8f-99b2-5895c3dbd47c/%E0%B8%81%E0%B8%B2%E0%B8%87%E0%B9%80%E0%B8%81%E0%B8%87%E0%B8%82%E0%B8%B2%E0%B8%AA%E0%B8%B1%E0%B9%89%E0%B8%99%E0%B8%9C%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%9F%E0%B8%A3%E0%B8%99%E0%B8%8A%E0%B9%8C%E0%B9%80%E0%B8%97%E0%B8%A3%E0%B8%B5%E0%B8%9C%E0%B8%B9%E0%B9%89-club-alumni-brQr5q.png',
      name: 'Nike Club Alummi',
      category: 'Shorts',
      stock: 10,
      price: 2300
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3e837787-98fe-4a8f-99b2-5895c3dbd47c/%E0%B8%81%E0%B8%B2%E0%B8%87%E0%B9%80%E0%B8%81%E0%B8%87%E0%B8%82%E0%B8%B2%E0%B8%AA%E0%B8%B1%E0%B9%89%E0%B8%99%E0%B8%9C%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%9F%E0%B8%A3%E0%B8%99%E0%B8%8A%E0%B9%8C%E0%B9%80%E0%B8%97%E0%B8%A3%E0%B8%B5%E0%B8%9C%E0%B8%B9%E0%B9%89-club-alumni-brQr5q.png',
      name: 'Nike Club Alummi',
      category: 'Shorts',
      stock: 10,
      price: 2300
    },
    {
      url: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3e837787-98fe-4a8f-99b2-5895c3dbd47c/%E0%B8%81%E0%B8%B2%E0%B8%87%E0%B9%80%E0%B8%81%E0%B8%87%E0%B8%82%E0%B8%B2%E0%B8%AA%E0%B8%B1%E0%B9%89%E0%B8%99%E0%B8%9C%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%9F%E0%B8%A3%E0%B8%99%E0%B8%8A%E0%B9%8C%E0%B9%80%E0%B8%97%E0%B8%A3%E0%B8%B5%E0%B8%9C%E0%B8%B9%E0%B9%89-club-alumni-brQr5q.png',
      name: 'Nike Club Alummi',
      category: 'Shorts',
      stock: 10,
      price: 2300
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