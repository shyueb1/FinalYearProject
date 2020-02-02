import React, { useState, useEffect, useContext } from 'react';
import NotificationContext from '../context/NotificationContext';
import '../static/styles/notification.css';

function Notification(props) {
    const [, setShowNotification] = useContext(NotificationContext);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        removeNotification();
        return () => {};
    })

    const removeNotification = () => {
        setTimeout(() => {
            setHidden(true);
            setShowNotification(false);
        }, 5000);
    }

    if(hidden){
        return null;
    }

    return (
        <div className="notification" 
        onClick={(e) => {
            setTimeout(() => {
                setHidden(true);
                setShowNotification(true);
            }, 1000);
        }}>
            <label htmlFor="notification-msg">Notification:</label>
            <h3 className="notification-msg">{props.message}</h3>
        </div>
    )
}

export default Notification;
