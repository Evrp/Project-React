import './Food.css';
import { BsBag } from 'react-icons/bs';

function Header(props) {
    return (
        <div className='flex shopping-card'>
            <div className="shopping"onClick={() => props.handleShow(false)} >Shopping Cart App</div>
            <div onClick={() => props.handleShow(true)}> <BsBag/>
                <sup> {props.count} </sup>
            </div>
        </div>
    );
}

export default Header;