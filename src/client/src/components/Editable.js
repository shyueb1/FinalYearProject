import React, { useState } from 'react';
import '../static/styles/card.css';
import Button from './Button';

function Editable(props) {
    // const [editable, setEditable] = useState(false);
    const [deleted, setDeleted] = useState(false);
    if(deleted){
        return null;
    }
    return (
        <div className="card" onClick={props.onClick}>
            <div className="card-content">
                <div className="card-top">
                    <h2 className="card-header">
                        <span className="card-title">{props.itemName}</span>
                        <span className="card-title-desc">£{props.estCost}</span>
                        <span className="card-title-desc">{props.itemLocation}</span>
                    </h2>
                    <img  src={"https://test123-njs.s3.eu-west-2.amazonaws.com/"+props.img} alt="Item"></img>
                </div>
                <br></br>
                <div className="card-middle">
                <p>{props.desc}</p>
                </div>
                <br></br>
                <div className="card-bottom">
                    {/* <ToggleButton
                     primary={"Edit"} secondary={"Save"}
                     primaryClass={"outline-yellow"} secondaryClass={"outline-green"} 
                     onClick={(e) => {editable ? setEditable(false) : setEditable(true); console.log(editable);}}
                    /> */}
                    <Button className={"outline-red"} name={"Delete"}
                     onClick={() => {
                        const confirmed = window.confirm("Are you sure you want to delete this item?");
                        if(confirmed){
                            setDeleted(true);
                            fetch('/api/item/delete',
                            {
                                method: 'post',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                                body: JSON.stringify({
                                    id: props.itemID
                                })
                            })
                            .then((response) => console.log(response))
                            .catch((err) => console.log(err));
                        }
                    }}/>
                    <Button className={"outline-yellow"} name={"View Offers"} />
                </div>
            </div>
        </div>
    )
}

export default Editable;