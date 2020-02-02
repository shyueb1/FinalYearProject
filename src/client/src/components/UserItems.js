import React, { useState, useEffect, useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Form from './Form';
import Editable from './Editable';
import ItemContext from '../context/ItemContext';
import UserContext from '../context/UserContext';
import '../static/styles/useritems.css';

function UserItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user] = useContext(UserContext);
    const [redirect, setRedirect] = useState(false);
    const [redirectDest, setRedirectDest] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch('/api/item/useritems', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'user': user
            })
        })
        .then((response) => response.json())
        .then((response) => {
            console.log(response + "Getting users items");
            setLoading(false);
            setItems([...response]);
        })
        .catch((err) => console.log(err));

        return () => {
        };
    }, [user]);

    if(loading){
        return <div className="user-items-container"><div className="loader"></div></div>
    }

    if(redirect){
        return <Redirect to={"/offersforitem/"+redirectDest} />
    }

    return (
        <Route>
            <ItemContext.Provider value={[items, setItems]}>
                <div className="user-items-container">
                    <div className="filter-user-items">
                        <Form />
                    </div>
                    <div className="user-items">
                        {items.map(item => {
                                return <Editable key={item.item_id}
                                            estCost={item.est_cost}
                                            itemName={item.item_name}
                                            img={item.main_img}
                                            desc={item.description}
                                            itemLocation={item.item_location}
                                            datePosted={item.date_posted}
                                            userPosted={item.user_posted}
                                            itemID={item.item_id}
                                            onClick={() => {
                                                setRedirect(true);
                                                setRedirectDest(item.item_id);
                                            }} 
                                        />
                        })}
                    </div>
                </div>
            </ItemContext.Provider>
        </Route>
    );
}

export default UserItems;