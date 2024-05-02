import React from 'react';
import './App.css';
import Navbar from './Navbar';
import Food from "./Homepage/Shop";
import Res from "./Homepage/Restuarant";
import LoginForm from './Homepage/LoginForm';
import Home from './Homepage/Home';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <>
     <Navbar />
    <div className="container">
      <Routes>
        <Route path='/hone' element={<Home/>}/>
        <Route path='/login' element={<LoginForm/>}/>
        <Route path='/food' element ={<Food/>}/>
        <Route path='/restuarant' element ={<Res/>}/>
      </Routes>
    </div>
    </>

  )
}

export default App;


