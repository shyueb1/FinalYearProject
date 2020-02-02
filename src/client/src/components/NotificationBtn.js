import React, { useState, useContext, useEffect } from 'react';
import SocketContext from '../context/SocketContext';
import UserContext from '../context/UserContext';
import Button from './Button';
import Authentication from '../services/Authentication';
import '../static/styles/notificationbtn.css';

function NotificationBtn(props) {
    const [socket] = useContext(SocketContext);
    const [user] = useContext(UserContext);
    const [notifications, setNotifications] = useState([]);
    const [hidden, setHidden] = useState(false);
    const [unseenNotifications, setUnseenNotifications] = useState(0);
    const [newNotification, setNewNotification] = useState("");

    const getNotifications = () => {
        fetch('/api/account/allnotifications', {
            method: 'GET',
            headers: {
                'Authorization': Authentication.getToken()
            }
        })
        .then((response) => response.json())
        .then((response) => {
            // console.log(response);
            let unseen = 0;
            response.map((notification) => {
                if(notification.notification_seen === false){
                    unseen++;
                }
            })
            setNotifications([...response]);
            setUnseenNotifications(unseen);
        })
        .catch((err) => console.log(err));
    }

    const handleSocketNotifications = (socket) => {
        socket.on('notification', (newNotif) => {
            setNewNotification(newNotif);
        });
    }

    useEffect(() => {
        let counter = unseenNotifications + 1;
        setUnseenNotifications(counter);
        setNotifications([...notifications, newNotification]);
        return () => {};
    }, [newNotification]);

    useEffect(() => {
        getNotifications();
        return () => {};
    }, [user]);

    useEffect(() => {
        if(socket && user){
            handleSocketNotifications(socket);
        } 
        return () => {};
    }, [socket])

    const getLatestSeenNotification = () => {
        let max = -1;
        notifications.forEach((notification) => {
            if(notification.notification_id > max){
                max = notification.notification_id;
            }
        })
        return max;
    }

    const removeNotifications = () => {
        const maxNotificationId = getLatestSeenNotification();
        if(maxNotificationId > -1 && unseenNotifications > 0){
            fetch(`/api/account/notifications/${maxNotificationId}`, {
                method:'GET',
                headers:{
                    'Authorization': Authentication.getToken(),
                    'Accept': 'application/json'
                }
            })
            .then((response) => response.json())
            .then((response) => {
                console.log(response);
                setUnseenNotifications(0);
            })
            .catch((err) => console.log(err));
        }else{
            console.log("All notifications already seen!");
        }
    }

    return (
        <div className="notification-container">
            <Button name={`${unseenNotifications} Notifications`} className="notificationbtn"
                onClick={(e) => {
                    if(hidden){
                        setHidden(false);
                        removeNotifications();
                    }else{
                        setHidden(true);
                    }
                }}
            />
           
            {hidden ? 
                    <div className="notification-msgs">
                        {
                            notifications.map((ntf) => {
                                return <div key={ntf.notification_id} className="notification-msg">{`${ntf.type} from ${ntf.notification_from}`}</div>
                            })
                        }
                    </div>
                :
                    null
            }
        </div>
    )
}

export default NotificationBtn;
