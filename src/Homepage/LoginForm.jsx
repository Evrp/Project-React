import React from 'react'
import { RiUserFill } from "react-icons/ri";
import { FaLock } from "react-icons/fa";
import './Login1.css'
const LoginForm = () => {
  return (
    <div className="wrapper">
    <form action="#">
        <h1>Welcome</h1>
        <div className="input-box">
            <RiUserFill className="icon"/>
            <input type="email" id='email' placeholder="Username" required/>
            <i className='bx bxs-user'></i>
        </div>

        <div className="input-box">
            <FaLock className="icon"/>
            <input type="password" placeholder="Password" required/>
            <i className='bx bxs-lock-alt'></i>
        </div>

        <div className="input-box1 mx-2">
            <a href="#" className='Forgot'></a>
            <input type="Forgot Password?" placeholder="Forgot Password?" required/>
        </div>
        
        <button type="submit" className='Login'>Login</button>
        <p>Don't have an account? <a href="#" className='Sign-up'>Sign up</a></p>
    </form>
</div>


  )
}

export default LoginForm
