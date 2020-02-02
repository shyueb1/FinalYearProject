import React, { useEffect, useState, useContext } from 'react';
import Button from './Button';
import Horizontal from './Horizontal';
import Loading from './Loading';
import LoadContext from '../context/LoadContext';
import ItemContext from '../context/ItemContext';
import ItemOffer from './ItemOffer';
import '../static/styles/itempage.css';
import ModalContext from '../context/ModalContext';
import UserContext from '../context/UserContext';
import Authentication from '../services/Authentication';

function ItemPage(props) {
    const [, setModalVisible, , setModalRecipient] = useContext(ModalContext);
    const [user] = useContext(UserContext);
    const [loading, setLoading] =  useState(false);
    const itemId = props.location.pathname.split("/")[props.location.pathname.split("/").length - 1];
    const [img, setImg] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [desc, setDesc] = useState("");
    const [seller, setSeller] = useState("");
    const [itemExpired, setItemExpired] = useState("");
    const [timer, setTimer] = useState("");
    const [userWonItem, setUserWonItem] = useState(false);

    useEffect(() => {
        const countdown = setInterval(() => {
            if(timer <= 1000){
                setItemExpired(true);
                setTimer(0);
                checkIfUserWonBid()
                .then(response => response.json())
                .then((response) => {
                    if(response.acceptedOffer.user_name === user && user !== undefined && response.acceptedOffer.user_name !== undefined){
                        setUserWonItem(true);
                    }
                });
            }else{
                setTimer(timer - 1000);
            }
        }, 1000);
        return () => { clearInterval(countdown); };
    }, [timer])

    //Get items info
    useEffect(() => {
        setLoading(true);
        fetch(`/api/item/itembyid/${itemId}`, {
            method: 'GET', 
            headers: {
                'Accept': 'application/json'
            }
        })
        .then((response) => response.json())
        .then((item) => {
            setLoading(false);
            setImg(item.main_img);
            setLocation(item.item_location);
            setDate(item.date_posted);
            setItemName(item.item_name);
            setCategory(item.category);
            setDesc(item.description);
            setSeller(item.user_posted);
            setItemExpired(item.expired);
            const dayInMs = 24*60*60*1000;
            const startPlusWeek = new Date(item.date_posted).getTime() + (7*dayInMs);
            setTimer(startPlusWeek - new Date().getTime()); 
        });
        return () => {};
    }, [itemId]);

    if(loading){
        return (
            <Loading />
        )
    }

    const checkIfUserWonBid = () => {
        return fetch(`/api/item/bidding/${38}`, {
            method:'GET',
            headers:{
                'Authorization': Authentication.getToken()
            }
        });
    }

    if(itemExpired){
        if(user === seller){
            return <h1 className="content-body">Item auction has ended. Please accept an offer on the offer page for this item.</h1>;
        }else if(user === "" || user === undefined){
            return <h1 className="content-body">Bidding has ended for this item.</h1>
        }else{
            if(userWonItem){
                return <h1 className="content-body">You have won the bid for this item. Please communicate with the seller to transfer goods.</h1>;
            }else{
                return <h1 className="content-body">Bidding has ended for this item. You haven't won.</h1>
            }
        }
        // checkIfUserWonBid()
        // .then(response => response.json())
        // .then((response) => {
        //     if(user === seller){
        //         return <h1 className="content-body">Item auction has ended. Please accept an offer on the offer page for this item.</h1>;
        //     }else{
        //         if(response.acceptedOffer.user_name === user){
        //             return <h1 className="content-body">You have won the bid for this item. Please communicate with the seller to transfer goods.</h1>;
        //         }else{
        //             return <h1 className="content-body">Bidding has ended for this item. You haven't won.</h1>
        //         }
        //     }
        // });
    }

    const getTimer = () => {
        const daysLeft = Math.floor(timer/(1000*60*60*24));
        let hoursLeft = timer - (daysLeft*1000*60*60*24);
        hoursLeft = Math.floor(hoursLeft/(1000*60*60));
        let minutesLeft = timer - (daysLeft*1000*60*60*24) - (hoursLeft*1000*60*60);
        minutesLeft = Math.floor(minutesLeft/(1000*60));
        let secondsLeft = timer - (daysLeft*1000*60*60*24) - (hoursLeft*1000*60*60) - (minutesLeft*1000*60);
        secondsLeft = Math.floor(secondsLeft/(1000));
        return Math.ceil(daysLeft) + " days, " + hoursLeft + " hours, " + minutesLeft + " minutes, " + secondsLeft + " seconds.";
    }

    return (
        <div className="item-page">
            <LoadContext.Provider value={[loading, setLoading]}>
                <div className="item-details-container">
                    <div className="item-desc-short">
                        <img src={"https://test123-njs.s3.eu-west-2.amazonaws.com/"+img} alt="visual of item"></img>
                        <Horizontal />
                        <div className="item-img-capt">
                            {getTimer()}
                        </div>
                    </div>
                    <div className="item-desc-long">
                        <div className="item-name">
                            <h1>{itemName}</h1>
                            <Horizontal />
                        </div>
                        <div className="item-details">
                            <h3>Location</h3>
                            <p>{location}</p>
                            <Horizontal />
                            <br />
                            <h3>Date Listed</h3>
                            <p>{date}</p>
                            <Horizontal />
                            <br />
                            <h3>Category</h3>
                            <p>{category}</p>
                            <Horizontal />
                            <br />
                            <h3>Description</h3>
                            <p>{desc}</p>
                        </div>
                    </div>
                    {user ? 
                    <div className="offer-form">
                        <h1>Your Offer</h1>
                        <br />
                        <ItemOffer itemTradingFor={itemId}/> 
                    </div>
                    : null}
                    <div className="item-contact-info">
                        <h1>Seller: {seller}</h1>
                        <br />
                        <Button name={"Message "+seller} className="outline-blue" onClick={(e) => {
                            setModalRecipient(seller);
                            setModalVisible(true);
                        }} />
                    </div>
                </div>
            </LoadContext.Provider>
        </div>
    )
}

export default ItemPage;
