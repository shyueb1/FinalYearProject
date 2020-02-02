import React, { useState, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import UserContext from '../context/UserContext';
import Authentication from '../services/Authentication';
import Carousel from '../components/Carousel';
import Button from '../components/Button';
import Loading from '../components/Loading';
import '../static/styles/offersforitem.css';

function OffersForItem(props) {
    const [, user, ] = useContext(UserContext);
    const [item, setItem] = useState({});
    const [tradeOffers, setTradeOffers] = useState([]);
    const [tradeOfferItems, setTradeOfferItems ] = useState([]);
    const itemId = props.location.pathname.split("/")[props.location.pathname.split("/").length - 1];
    const [redirect, setRedirect] = useState(false);
    const [redirectTo, setRedirectTo ] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/item/getitemoffers/${itemId}`, {
            method: 'GET', 
            headers: {
                'Authorization': Authentication.getToken(),
                'Accept': 'application/json'
            }
        })
        .then((response) => response.json())
        .then((response) => {
            setLoading(false);
            setTradeOffers([...response.tradeOffers]);
            setTradeOfferItems(response.items);
        })
        .catch((err) => console.log(err));
        return () => {};
    }, []);

    useEffect(() => {
        fetch(`/api/item/itembyid/${itemId}`, {
            method:'GET'
        })
        .then((response)=>response.json())
        .then((response) => {
            console.log(response);
            setItem(response);
        })
        .catch((err) => console.log(err));
        return () => {};
    }, []);

    if(redirect){
        return <Redirect to={`/item/${redirectTo}`} />
    }

    if(loading){
        return <Loading />
    }

    return (
        <div className="offers-container"> 
            <div className="header">
                <h1 className="item-name">Offers for your item</h1>
                <Button 
                        className="outline-blue"
                        onClick={() => {
                            setRedirect(true);
                            setRedirectTo(item.item_id);
                        }} 
                        name={item.item_name}
                    >
                        {item.item_name}
                </Button>
            </div>
            <Carousel 
                key={tradeOffers}
                tradeOffers={tradeOffers}
                tradeOfferItems={tradeOfferItems}
                className={"carousel-container"}
            >
            </Carousel>
        </div>
    )
}

export default OffersForItem;
