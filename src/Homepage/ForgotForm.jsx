import React from 'react';
import './Login.css'

import {Link} from 'react-router-dom';
const ForgotPassword = () => {
  return (
    <div className="wrapper">
      <div className="form forgot-password">
        <header>Forgot Password?</header>
        <form action="#">
          <input type="text" placeholder="Email" required />
          <input type="submit" value="Reset Password" />
        </form>
        <Link to="/login">Back to Login</Link>
        <Link to="/login" className="logout-button">Logout</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;