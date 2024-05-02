import React, {useState}from 'react'
import { FiMenu, FiX } from 'react-icons/fi';
import {Link} from 'react-router-dom';
import './Navbar.css';
const Navbar = () => {

    const[click,setClick] = useState(false);
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);

    return (
        <div className="navbar">
            <div className="container">
                <div className="navbar-con">
                    <div className="logo-con">
                        <Link to='/hone'>Home</Link>
                    </div>
                    <ul className={click ? 'menu active':'menu'}>
                        <li className='menu-link' onClick={closeMobileMenu}>
                            <Link to='/food'>SHOP</Link>
                        </li>
                        <li className='menu-link' onClick={closeMobileMenu}>
                            <Link to='/login'>LOGIN</Link>
                        </li>
                    </ul>
                    <div className="mobile-menu" onClick={handleClick}>
                        {click ? (
                            <FiX />
                        ) : (
                            <FiMenu/>
                        )}
                    </div>
                </div>
            </div>
        </div>
  )
}
export default Navbar