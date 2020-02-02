import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import NotificationBtn from './NotificationBtn';
import Dropdown from './Dropdown';
import '../static/styles/navbar.css';
import Authentication from '../services/Authentication';
import UserContext from '../context/UserContext';
import ItemContext from '../context/ItemContext';

function Navbar() {
    const [user, setUser] = useContext(UserContext);
    const [search, setSearch] = useState("");
    const [originalItems,, setItems] = useContext(ItemContext);
    const [notifications, setNotifications] = useState([]);

    const changeInput = (e) => {
        setSearch(e.target.value);
    }

    const logout = () => {
        Authentication.logout();
        setUser("");
    }

    const getItems = (query) => {
        fetch(`/api/item/itemsbysimilarname/`, {
            method: "post",
            headers : { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: search
            })
        })
        .then((result) => result.json())
        .then(searchedItems => {
            // console.log(searchedItems);
            // console.log(search);
            setItems([...searchedItems]);
        });
    };

    return (
        <div className="nav-container">
            <div className="navbar">
                <ul >
                    <li id="logo-btn" onClick={() => setItems([...originalItems])}><Link to="/">AnyTimeTrade</Link></li>
                {user ?
                    <Fragment>
                        <li><Dropdown parent={user} children={[
                            {'name': 'Your items', 'link': '/account/items'},
                            {'name': 'Your offers', 'link': '/account/offers'}
                        ]} /></li>
                        <li id="listitem-btn"><Link to="/listitem"><Button name="List Item+" /></Link></li>
                        <li id="search">
                            <form action="#" onSubmit={(e) => {
                                e.preventDefault(); 
                                getItems(search);
                                setSearch("");
                            }}>
                                <input id="search-box" type="text" name="search" value={search} onChange={(e) => changeInput(e)}/>
                                <input id="search-btn" type="submit" value="Search"/>
                            </form>
                        </li>
                        {/* <li id="notif-btn"><Button name="Notifications" /></li> */}
                        <li id="notif-btn"><NotificationBtn /></li>
                        <li id="logout-btn"><Link to="/login"><Button name="Logout" onClick={(e) => logout()} /></Link></li>
                    </Fragment> 
                    :
                    <Fragment>
                        <li id="search">
                            <form action="#" onSubmit={(e) => {
                                e.preventDefault(); 
                                getItems(search);
                                setSearch("");
                            }}>
                                <input id="search-box" type="text" name="search" value={search} onChange={(e) => changeInput(e)}/>
                                <input id="search-btn" type="submit" value="Search"/>
                            </form>
                        </li>
                        <li id="login-btn"><Link to="/login"><Button name="Login" /></Link></li>
                        <li id="register-btn"><Link to="/register"><Button name="Register" /></Link></li>
                    </Fragment>
                } 
                </ul>
            </div>
        </div>
    );
}
Navbar.defaultProps = {
    search: () => {},
};
export default Navbar;
