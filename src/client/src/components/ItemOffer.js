import React, { useState, useEffect, useContext, Fragment } from 'react';
import LoadContext from '../context/LoadContext';
import NotificationContext from '../context/NotificationContext';
import Button from './Button';
import Authentication from '../services/Authentication';

function ItemOffer(props) {
    const [setNotificationMessage, setShowNotification] = useContext(NotificationContext);
    const [, setLoading] = useContext(LoadContext);
    const [userItems, setUserItems] = useState([]);
    const [selectedItem1, setSelectedItem1] = useState(null);
    const [selectedItem2, setSelectedItem2] = useState(null);
    const [selectedItem3, setSelectedItem3] = useState(null);
    const [moneyOffered, setMoneyOffered] = useState(0);
    const [message, setMessage] = useState("");
    const [formErrors, setFormErrors] = useState("");

    //Get users items
    useEffect(() => {
        fetch('/api/item/userallitems', {
            headers: {
                'Accept': 'application-json',
                'Authorization': Authentication.getToken()
            }
        })
        .then((response) => response.json())
        .then((response) => {
            if(!response.error){
                setUserItems(response);
            }
        })
        return () => {};
    }, []);
    
    const validateForm = () => {
        if(moneyOffered < 0){
            setFormErrors("You cannot offer a negative amount of money.");
            return false;
        }

        const items = [selectedItem1, selectedItem2, selectedItem3].filter((v, i, a) => {
            if(v === null || v === 0){
                return true;
            }
            return a.indexOf(v) === i;
        });

        if(items.length < 3){
            console.log(items);
            setFormErrors("You cannot offer a single item multiple times!");
            return false;
        }

        if(moneyOffered === 0){
            let emptyOffer = true;
            items.forEach(item => {
                if(item !== null){
                    emptyOffer = false;
                }
            });
            if(emptyOffer){
                setFormErrors("You have not offered money or items.");
                return false;
            }
        }

        setFormErrors("");
        return true;
    }

    const createOffer = () => {
        if(validateForm()){
            setLoading(true);
            const items = [selectedItem1, selectedItem2, selectedItem3].filter((index) => {
                return index !== null && index !== 0;
            });
            const itemsOffered = items.map((index) => {
                return userItems[index-1].item_id;
            });

            fetch('/api/item/makeoffer', {
                method: 'POST',
                headers:{
                    'Authorization': Authentication.getToken(),
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify({
                    'itemsOffered': itemsOffered,
                    'moneyOffered': moneyOffered,
                    'message': message,
                    'itemTradingFor': props.itemTradingFor
                })
            })
            .then((response) => {
                setLoading(false);
                setNotificationMessage("Your offer has been sent!");
                setShowNotification(true);
            })
            .catch((err) => console.log(err));
        }
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); createOffer(); }}>
            <label htmlFor="money-offered">Money offered (£):</label>
            <br />
            <input type="number" value={moneyOffered} onChange={(e) => setMoneyOffered(e.target.value)} name="money-offered" />
            <br />
            <br />
            <label htmlFor="item-1">Items offered:</label>
            <br />
            <select 
                name="item-1"
                onChange={(e) => {
                    const selectedItem = e.target.selectedIndex;
                    e.target.options[selectedItem].selected = true;
                    console.log(selectedItem);
                    setSelectedItem1(selectedItem);
                }}
            >
                <option selected={selectedItem1 === null ? true : false}>Select an item to trade</option>
                {userItems.map((item) => {
                    return <option key={item.item_id} selected={false}>{item.item_name}</option>
                })}
            </select> 
            <select 
                name="item-2"
                onChange={(e) => {
                    const selectedItem = e.target.selectedIndex;
                    e.target.options[selectedItem].selected = true;
                    console.log(selectedItem);
                    setSelectedItem2(selectedItem);
                }}
            >
                <option selected={selectedItem2 === null ? true : false}>Select an item to trade</option>
                {userItems.map((item) => {
                    return <option key={item.item_id} selected={false}>{item.item_name}</option>
                })}
            </select>  
            <select 
                name="item-3"
                onChange={(e) => {
                    const selectedItem = e.target.selectedIndex;
                    e.target.options[selectedItem].selected = true;
                    console.log(selectedItem);
                    setSelectedItem3(selectedItem);
                }}
            >
                <option selected={selectedItem3 === null ? true : false}>Select an item to trade</option>
                {userItems.map((item) => {
                    return <option key={item.item_id} selected={false}>{item.item_name}</option>
                })}
            </select>   
            <br />
            <br />
            <label htmlFor="message">Message:</label>
            <br />
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} maxLength="300" />
            <br />
            {formErrors === "" ? <Fragment></Fragment> : <h4 className="form-error">{formErrors}</h4>}
            <Button name="Submit offer" className="outline-green" />
        </form>
    )
}

export default ItemOffer;
