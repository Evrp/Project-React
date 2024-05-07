import React from 'react';
import './App.css';
import Navbar from './Navbar';
import Random from './Homepage/Random';
import Food from "./Homepage/Food";
import LoginForm from './Homepage/LoginForm';
import Home from './Homepage/Home';
import { Route, Routes } from 'react-router-dom';
import ForgotPassword from './Homepage/ForgotForm';


const App = () => {
  return (
    <>
     <Navbar />
    <div className="container">
      <Routes>
        <Route path='/hone' element={<Home/>}/>
        <Route path='/login' element={<LoginForm/>}/>
        <Route path='/food' element ={<Food/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/randDom' element={<Random/>}/>
      </Routes>
    </div>
    </>

  )
}

export default App;
