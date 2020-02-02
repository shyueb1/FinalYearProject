import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import '../static/styles/card.css';
import Button from './Button';
import ModalContext from '../context/ModalContext';
import UserContext from '../context/UserContext';

function Card(props) {
    const [, setModalVisible, , setModalRecipient] = useContext(ModalContext);
    const [redirect, setRedirect] = useState(false);
    const [user] = useContext(UserContext);

    if(redirect){
        return <Redirect to={`/item/${props.itemId}`} />
    }

    return (
        <div className="card" onClick={(e) => setRedirect(true)}>
            <div className="card-content">
                <div className="card-top">
                    <h2 className="card-header">
                        <span className="card-title">{props.itemName}</span>
                        <span className="card-title-desc">£{props.estCost}</span>
                        <span className="card-title-desc">{props.itemLocation}</span>
                    </h2>
                    {
                    props.img ? 
                        <img src={"https://test123-njs.s3.eu-west-2.amazonaws.com/"+props.img} alt="item"></img> :
                        <img alt="item"></img>
                    }
                </div>
                <br></br>
                <div className="card-middle">
                <p>{props.desc}</p>
                </div>
                <br></br>
                <div className="card-bottom">
                    <small>Posted: {props.datePosted.substring(0,10)}</small>
                    <Button name={props.userPosted} onClick={(e) => {
                        if(user){
                            setModalRecipient(props.userPosted);
                            setModalVisible(true);
                        }
                        e.stopPropagation();
                    }}/>
                </div>
            </div>
        </div>
    )
}

export default Card;