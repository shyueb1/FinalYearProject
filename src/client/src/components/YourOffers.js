import React, { useState, useContext, useEffect } from 'react';

function YourOffers() {
    const [offers, setOffers] = useState([]);
    
    useEffect(() => {
        fetch(``, {
            method:'',
            headers:{
        
            }
        })
        .then((response)=>response.json())
        .then((response) => {
            console.log(response);
        })
        .catch((err) => console.log(err));
        return () => {};
    }, []);
    
    return (
        <div>
            <h1>HI</h1>
        </div>
    )
}

export default YourOffers;
