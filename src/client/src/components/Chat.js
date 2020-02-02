import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../context/UserContext';
import SocketContext from '../context/SocketContext';
import Authentication from '../services/Authentication';
import '../static/styles/chat.css';

function Chat() {
    const [socket] = useContext(SocketContext);
    const [openChat, setOpenChat] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [chatParticipants, setChatParticipants] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(chatParticipants.length > 0 ? chatParticipants[0] : [{
        'message': 'Click on a user to send a message! ---->',
        'key': Date.now(),
        'sender': 'System',
        'message_id': Date.now()
    }]);
    const [user] = useContext(UserContext);
    const [socketMessage, setSocketMessage] = useState("");

    const sendMsg = () => {
        let receivingUser = "";
        if(currentChat[0].sender === user){
            receivingUser = currentChat[0].receiver;
        }else{
            receivingUser = currentChat[0].sender;
        }
        const messageObj = {
            'receiver': receivingUser,
            'sender': user,
            'message': newMessage
        };
        return socket ? socket.emit('sendMessage', messageObj) : console.log('Socket not connected.');
    }

    const updateChats = () => {
        const index = chatMessages.indexOf(currentChat);
        const newMessages = chatMessages;
        const date = Date.now();
        newMessages[index].push({
            'message': newMessage,
            'key': date,
            'sender': user,
            'message_id': date
        });
        setChatMessages([...newMessages]);
    }

    useEffect(() => {
        const date = Date.now();
        const chatIndex = chatParticipants.indexOf(socketMessage.sender);
        if(chatIndex < 0){
            //no chat exists with this user
            //make new chat and push chat messages to it
            setChatParticipants([...chatParticipants, socketMessage.sender]);
            setChatMessages([...chatMessages, [{
                'message': socketMessage.message,
                'key': date,
                'sender': socketMessage.sender,
                'message_id': date
            }]]);
        }else{
            const newMessages = chatMessages;
            if(newMessages.length > 0){
                newMessages[chatIndex].push({
                    'message': socketMessage.message,
                    'key': date,
                    'sender': socketMessage.sender,
                    'message_id': date
                });
                setChatMessages([...newMessages]);
            }
        }
        return () => {};
    }, [socketMessage]);

    const handleSocketEvents = (socket, authUser) => {
        console.log("Adding socket event handlers.");
        
        socket.on('connection', () => {
            console.log("connected");
        });

        socket.emit('join', {
            'room': authUser
        });

        socket.on('joinResponse', (response) => {
            console.log(response);
        });

        socket.on('chatMessage', (msg) => {
            setSocketMessage(msg);
        });
    }

    const authenticate = async () => {
        const auth = await Authentication.initAuth();
        return auth.getAuthUser();
    }

    //Get users chats
    useEffect(() => {
        if(user){
            fetch('/api/account/allchats', {
                method: 'GET',
                headers: {
                    'Authorization': Authentication.getToken(),
                    'Accept': 'application/json'
                }
            })
            .then((response) => response.json())
            .then((response) => {
                if(!response.error){
                    setChatParticipants(response.chatParticipants);
                    const chats = [];
                    const messages = response.chatMessages.forEach((chat) => {
                        const cMessages = [];
                        chat.map((message) => {
                            message.key = message.message_id;
                            return cMessages.push(message);
                        })
                        chats.push(cMessages);
                    });
                    setChatMessages(chats);
                }
            })
            .catch((err) => console.log(err));
        }
        return () => {};
    }, [user])

    useEffect(() => {
        const messageBox = document.querySelector('.chat-messages');
        messageBox.scrollTop = 100000;
        return () => {};
    }, [chatMessages]);

    useEffect(() => {
        if(socket && user){
            console.log(user);
            const authUser = authenticate();
            authUser.then((authorised) => {
                if(authorised){
                    if(user === authorised.username){
                        handleSocketEvents(socket, authorised.username);
                    }else{
                        console.log(user+"X"+authorised.username);
                        console.log("Username forged not matching token.");
                    }
                }else{
                    console.log("User not authorised for socket.");
                    Authentication.logout();
                }
            });
        }
        return () => {}
    }, [socket])

    return (
        <div className="chat-container">
            <div className="chat-icon" onClick={(e) => { openChat ? setOpenChat(false) : setOpenChat(true)}}>
            </div>
            {openChat ? 
                <div className="chat-interface">
                    <div className="chat-messages-container">
                        <div className="chat-input">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                updateChats();
                                sendMsg();
                                setNewMessage("");
                                console.log(chatParticipants);
                            }}>
                                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." type="text" />
                            </form>
                        </div>
                        <div className="chat-messages">
                            {currentChat.map((message) => {
                                return <div 
                                        className="chat-message" 
                                        key={message.message_id}
                                        >
                                            {message.sender}: {message.message}
                                        </div>
                            })}
                        </div>
                    </div>
                    <div className="chat-contacts">
                        {
                            chatParticipants.map((participant) => {
                                return <div 
                                        className={`chat-contact ${currentChat === participant ? "active" : "" }`}
                                        key={participant}
                                        onClick={(e) => {
                                            setCurrentChat(chatMessages[chatParticipants.indexOf(participant)]);
                                            document.querySelectorAll(".active").forEach((element) => {
                                                element.classList.remove("active");
                                            });
                                            e.target.classList.add("active");
                                        }}
                                        >
                                            {participant}
                                        </div>
                            })
                        }  
                    </div>
                </div>
            : 
                <div className="chat-interface hidden">
                    <div className="chat-messages-container">
                        <div className="chat-input">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const index = chatParticipants.indexOf(currentChat);
                                const newMessages = chatMessages;
                                newMessages[index].push(newMessage);
                                console.log(newMessages);
                            }}>
                                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." type="text" />
                            </form>
                        </div>
                        <div className="chat-messages">
                            {currentChat.map((message) => {
                                return <div 
                                        className="chat-message" 
                                        key={message.message_id}
                                        >
                                            {message.sender}: {message.message}
                                        </div>
                            })}
                        </div>
                    </div>
                    <div className="chat-contacts">
                        {
                            chatParticipants.map((participant) => {
                                return <div 
                                        className={`chat-contact ${currentChat === participant ? "active" : "" }`}
                                        key={participant}
                                        onClick={(e) => {
                                            setCurrentChat(chatMessages[chatParticipants.indexOf(participant)]);
                                            document.querySelectorAll(".active").forEach((element) => {
                                                element.classList.remove("active");
                                            });
                                            e.target.classList.add("active");
                                        }}
                                        >
                                            {participant}
                                        </div>
                            })
                        }  
                    </div>
                </div>
            }
        </div>
    )
}

export default Chat;
