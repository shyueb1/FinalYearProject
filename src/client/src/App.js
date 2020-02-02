import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import io from 'socket.io-client';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import UserItems from './components/UserItems';
import ListItem from './components/ListItem';
import ItemPage from './components/ItemPage';
import Chat from './components/Chat';
import Modal from './components/Modal';
import Authentication from './services/Authentication';
import './static/styles/App.css';
import ProtectedRoute from './components/ProtectedRoute';
import Notification from './components/Notification';
import UserContext from './context/UserContext';
import ItemContext from './context/ItemContext';
import SocketContext from './context/SocketContext';
import LoadContext from './context/LoadContext';
import NotificationContext from './context/NotificationContext';
import ModalContext from './context/ModalContext';
import OffersForItem from './components/OffersForItem';
import YourOffers from './components/YourOffers';

function App() {
  const [user, setUser] = useState(Authentication.getUser());
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [load, setLoad] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRecipient, setModalRecipient] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(io('http://localhost:3001', {'forceNew': false})); 
  }, [user]);

  useEffect(() => {
    setLoad(true);
    fetch('/api/item/latestitems', {
    headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    })
    .then((response) => response.json())
    .then(final => {
        // console.log(final);
        setItems(final);
        setOriginalItems(final);
        setLoad(false);
    });
    return () => {
    };
  }, []);

  return ( 
    <UserContext.Provider value={[user, setUser]}>
      <ItemContext.Provider value={[originalItems, items, setItems]}>
        <SocketContext.Provider value={[socket]}>
          <LoadContext.Provider value={[load]}>
            <NotificationContext.Provider value={[setNotificationMessage, setShowNotification]}>
              <ModalContext.Provider value={[modalVisible, setModalVisible, modalRecipient, setModalRecipient]}>
                <Router>
                    <Navbar />
                    {user ? <Chat /> : null}
                    <Modal />
                    {showNotification ? <Notification message={notificationMessage}/> : null}

                    <Switch>
                      <Home exact path="/"/>
                      <Login exact path="/login" />
                      <Register exact path="/register" />
                      <Account exact path="/account" />
                      <ProtectedRoute exact path="/account/items" component={UserItems}/>
                      <ProtectedRoute exact path="/account/offers" component={YourOffers} />
                      <Route exact path="/item/:id" component={ItemPage} />
                      <ProtectedRoute exact path="/offersforitem/:id" component={OffersForItem} />
                      <ProtectedRoute exact path="/listitem" component={() => {return <ListItem />}}></ProtectedRoute>
                      <ProtectedRoute path="/testprotected" component={() => {return <Login />}}></ProtectedRoute>
                      <Route path="*" component={() => { return <h1 className="not-found-error">404 Not Found</h1>}}></Route>
                    </Switch>
                </Router>  
              </ModalContext.Provider>  
            </NotificationContext.Provider>
          </LoadContext.Provider>
        </SocketContext.Provider>
      </ItemContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
