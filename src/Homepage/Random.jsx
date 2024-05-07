import React, { useState } from 'react';
import './Random.css';
import {Link} from 'react-router-dom';

const Random = ({ products }) => {
  const [randomFood, setRandomFood] = useState(null);
  const [foodData, setFoodData] = useState([
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
  ]);

  const handleRandomFood = () => {
    const randomIndex = Math.floor(Math.random() * foodData.length);
    const randomFood = foodData[randomIndex];
    setRandomFood(randomFood);
  };

  return (
    <div className="container">
      <div className="container-bg">
        <div className="container-text">
          <h1>Click to Random</h1>
          <button onClick={handleRandomFood}>สุ่มอาหาร</button>
          {randomFood && (
            <div>
              <img src={randomFood.url} alt={randomFood.name} />
              <p>Name: {randomFood.name}</p>
              <p>ชื่ออาหาร: {randomFood.category}</p>
              <p>price/ราคา: {randomFood.price} ฿</p>
              <div className="linkfood">
                <Link to='/food'>Order</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Random;

