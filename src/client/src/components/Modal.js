import React, { useState, useContext } from 'react';
import Button from './Button';
import '../static/styles/modal.css';
import ModalContext from '../context/ModalContext';
import NotificationContext from '../context/NotificationContext';
import UserContext from '../context/UserContext';
import SocketContext from '../context/SocketContext';
import Authentication from '../services/Authentication';
import $ from 'jquery';

function Modal(props) {
    const [user] = useContext(UserContext);
    const [socket] = useContext(SocketContext);
    const [modalVisible, setModalVisible , modalRecipient, ] = useContext(ModalContext);
    const [setNotificationMessage, setShowNotification] = useContext(NotificationContext);
    const [message, setMessage] = useState("");

    if(!modalVisible){
        return null;
    }

    const sendMessage = () => {
        if(!(message === "")){
            sendMessageViaSocket();
            setNotificationMessage("Message has been sent!");
            setShowNotification(true);
            disappearModalAnim(false);
        }else{
            disappearModalAnim(true);
        }
        
        
    }

    const sendMessageViaSocket = () => {
        if(socket && user){
            socket.emit('sendMessage', {
                'receiver': modalRecipient,
                'sender': user,
                'message': message
            });
        }
    }

    const disappearModalAnim = (emptyMessage) => {
        $(".modal-container").animate({top: '-1000px'}, 750, () => {
            setModalVisible(false);
            if(!emptyMessage){
                document.location.reload();
            }
        });
    }

    return (
        <div className="modal-container">
            <div className="exit-modal" onClick={
                (e) => {
                    disappearModalAnim(true);
                }
            }>
                <Button className="outline-red" name="X" />
            </div>
            <form className="modal-form">
                <label htmlFor="recipient">Recipient</label>
                <br />
                <input id="modal-recipient" type="text" name="recipient" disabled value={modalRecipient}/>
                <br />

                <label htmlFor="message">Message:</label>
                <br />
                <textarea id="modal-msg" type="text" name="message" rows="20" value={message} 
                onChange={
                    (e) => setMessage(e.target.value)
                }/>
            </form>
            <Button name="Send Message" className="outline-blue"
            onClick={(e) => {
                sendMessage();
            }} />
        </div>
    )
}

export default Modal;
