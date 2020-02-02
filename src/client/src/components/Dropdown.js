import React, { useState, Fragment } from 'react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import '../static/styles/dropdown.css';

function Dropdown(props) {
    const [hidden, setHidden] = useState(true);
    return (
        <div className="dropdown">
            <Button name={props.parent} onClick={() => hidden ? setHidden(false) : setHidden(true)}/>
            {hidden ? 
                <Fragment></Fragment>
                :
                <div className="dropdown-items">
                    {props.children.map((child) => {
                        return <div key={child.name} className="dropdown-item"><Link to={child.link}><h5>{child.name}</h5></Link></div>
                    })}
                </div>
            }
        </div>
    );
};

Dropdown.defaultProps = {
    'children': []
};

export default Dropdown;
