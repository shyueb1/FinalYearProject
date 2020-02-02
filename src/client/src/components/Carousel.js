import React, { useState, useContext, useEffect, Fragment } from 'react';
import Button from './Button';
import Horizontal from './Horizontal';
import { Link } from 'react-router-dom';
import Authentication from '../services/Authentication';

function Carousel(props) {
    const [tradeOffers, setTradeOffers] = useState(props.tradeOffers);
    const [currentPage, setCurrentPage] = useState(0);

    const acceptOffer = (offerId) => {
        let accepted = window.confirm('Are you sure you want to accept this offer?');
        if(accepted){
            console.log("Accepted!");
            let updatedOffers = 
            tradeOffers.map((offer, i, a) => {
                if(offer.id === offerId){
                    offer.acceptedOffer = true;
                }
                return offer;
            });

            setTradeOffers(updatedOffers);

            fetch(`/item/acceptoffer/${offerId}`, {
                method:'PUT',
                headers:{
                    'Authorization': Authentication.getToken()
                }
            })
            .then((response)=>response.json())
            .then((response) => {
                console.log(response);
            })
            .catch((err) => console.log(err));
        }
    }

    const declineOffer = (offerId) => {
        let declined = window.confirm('Are you sure you want to decline this offer?');
        if(declined){
            let updatedOffers = 
            tradeOffers.map((offer, i, a) => {
                if(offer.id === offerId){
                    offer.acceptedOffer = false;
                }
                return offer;
            });

            setTradeOffers(updatedOffers);

            fetch(`/item/declineoffer/${offerId}`, {
                method:'PUT',
                headers:{
                    'Authorization': Authentication.getToken()
                }
            })
            .then((response)=>response.json())
            .then((response) => {
                console.log(response);
            })
            .catch((err) => console.log(err));
        }
    }

    return (
        <div className="tradeoffer-container">
            <div className="offer-details">
                {tradeOffers.map((offer, i, a) => {
                    if(i === currentPage){
                        if(offer.cashOnly){
                            return (
                                <Fragment>
                                    <div className="offer-header">
                                        {offer.acceptedOffer ? 
                                        <h2 className="accepted">ACCEPTED OFFER: Cash Only</h2>
                                            :
                                        <h2>Offer: Cash Only</h2>
                                    }
                                    </div>
                                    <div className="offer-info">
                                        <h3>Money offered: £{offer.moneyOffered}</h3>
                                        <br />
                                        <h3>Message: {offer.message}</h3>
                                    </div>
                                    <div className="offer-poster">Offer posted by <Button className="outline-blue" name={`${offer.postedBy}`} /></div>
                                    <div className="offer-footer">
                                        {offer.acceptedOffer ? 
                                            null
                                            :
                                            <Button name="Accept" className="green" onClick={() => acceptOffer(offer.id)}/>
                                        }
                                        <Button name="Decline" className="red" onClick={() => declineOffer(offer.id)}/>
                                    </div>
                                </Fragment>
                            )
                        }else{
                            return (
                                <Fragment>
                                    <div className="offer-header">
                                        {offer.acceptedOffer ? 
                                        <h2 className="accepted">ACCEPTED OFFER: Items and/or Cash</h2>
                                            :
                                        <h2>Offer: Items and/or Cash</h2>
                                    }
                                    </div>
                                    <div className="offer-info">
                                        <h3>Money offered: £{offer.moneyOffered}</h3>
                                        <br />
                                        <h3>Message: {offer.message}</h3>
                                    </div>
                                    <div className="offer-images">
                                        <h3>Items offered (click to see more details):</h3>
                                        <div className="offer-item-images">
                                            {props.tradeOfferItems.map((item, i, a) => {
                                                if(item.part_of_offer === offer.id){
                                                    return <Link to={`/item/${item.item_id}`}><img className="item-img" src={"https://test123-njs.s3.eu-west-2.amazonaws.com/"+item.main_img} alt="item"></img></Link>
                                                }
                                            })}
                                        </div>
                                    </div>
                                    <div className="offer-poster">Offer posted by <Button className="outline-blue" name={`${offer.postedBy}`} /></div>
                                    <div className="offer-footer">
                                        {offer.acceptedOffer ? 
                                            null
                                            :
                                            <Button name="Accept" className="green" onClick={() => acceptOffer(offer.id)}/>
                                        }
                                        <Button name="Decline" className="red" onClick={() => declineOffer(offer.id)}/>
                                    </div>
                                </Fragment>
                            )
                        }
                    }else{
                        return null;
                    }
                })}
            </div>
            <div className="carousel-controls">
                <Button className="outline-blue" name="Previous" onClick={() => { if(currentPage > 0){setCurrentPage(currentPage-1);}}} />
                <div className="indicators">
                    {tradeOffers.map((v, i, a) => {
                        if(i === currentPage){
                            return <div className="active-indicator"></div>
                        }else{
                            return <div className="indicator"></div>
                        }
                    })}
                </div>
                <Button className="outline-blue" name="Next" onClick={() => { if(currentPage < tradeOffers.length - 1){setCurrentPage(currentPage+1);}}}/>
            </div>
        </div>
    )
}

export default Carousel;
