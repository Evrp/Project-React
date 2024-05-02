import React from 'react';
import { Link,} from 'react-router-dom';
import './Login.css';

const LoginForm = () => {
  const handleLoginHeaderClick = () => {
    const wrapper = document.querySelector('.wrapper');
    wrapper.classList.add('active');
  };

  const handleSignupHeaderClick = () => {
    const wrapper = document.querySelector('.wrapper');
    wrapper.classList.remove('active');
  };

  return (
    <div className="wrapper">
      <div className="form signup">
        <header onClick={handleSignupHeaderClick}>Sign up</header>
        <form action="#">
          <input type="text" placeholder="Username" required />
          <input type="text" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <div className="checkbox">
            <input type="checkbox" id="signupCheck" />
            <label htmlFor="signupCheck">I accept all terms & conditions</label>
          </div>
          <input type="submit" value="Signup" />
        </form>
      </div>

      <div className="form login">
        <header onClick={handleLoginHeaderClick}>Login</header>
        <form action="#">
          <input type="text" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <Link to="/forgot-password">Forgot password?</Link>
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default LoginForm;