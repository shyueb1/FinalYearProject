const pubVKey = 'BIoFhC7ZHCi_r6FXGAm3KrrTqWNXnpvlUKJyXJpNOEPTJuZ3Rn0KeV7oaX7yvM9IbxjEzTky7TFuecks3VTewQU';
var serviceWorkerExists = false;

if('serviceWorker' in navigator){
    serviceWorkerExists = true;
}

function send(msg){
        navigator.serviceWorker.register('/js/worker.js', {
        scope: '/js/' //where this sw applies
    }).then((register) => {
            register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(pubVKey)
        }).then((subscription) => {
            return fetch('/push/subscribe', {
                method: 'POST',
                body: JSON.stringify({subscription: subscription, msg:msg}),
                headers: {
                    'content-type': 'application/json'
                }
            });
        });
    })
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
   
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
   
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

if(user){ 
    var socket = io();
    socket.on('connect', (data) => {
        window.onbeforeunload = () => {
            socket.disconnect();
            
        };
        socket.emit('join', {
            'room':user
        });
        
        socket.on('missed messages', (missedMessages) => {
            var oldURL = document.referrer;
            if(!oldURL.includes('/login')){
                var today = new Date();
                var dateNow = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                // var chatBoxMsgs = document.getElementById('chatBox').children;
                missedMessages.forEach((message) => {
                    var messageAddedToArray = false;
                    allChatsGrouped.forEach((chat) => {
                        var chatParticipant1 = chat[0].sender;
                        var chatParticipant2 = chat[0].receiver;
                        if((message.sender == chatParticipant1 && message.receiver == chatParticipant2) || (message.sender == chatParticipant2 && message.receiver == chatParticipant1)){
                            message.date = dateNow;
                            chat.push(message);
                            messageAddedToArray = true;
                            //Check if chat with this person is open then add it 
                            if(document.getElementsByClassName('open-chat')[0] !== undefined && message.sender == document.getElementsByClassName('open-chat')[0].innerHTML){
                                addMessageToChat(message.sender, message.message, dateNow);
                            }
                        }
                    });
                    if(!messageAddedToArray){
                        location.reload();
                    }
                });
            }
        });

        socket.on('chat message', (message) => {
            if(serviceWorkerExists){
                send("New Chat message from: " + message.sender);
            }
            var audio = new Audio('sounds/notification.mp3');
            audio.play();
            //Add notification
            addNotification('Message', message.sender, 'false');
            // Add message to chat
            var today = new Date();
            var dateNow = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var chatBoxMsgs = document.getElementById('chatBox').children;
            var messageAddedToArray = false;
            allChatsGrouped.forEach((chat) => {
                var chatParticipant1 = chat[0].sender;
                var chatParticipant2 = chat[0].receiver;
                if((message.sender == chatParticipant1 && message.receiver == chatParticipant2) || (message.sender == chatParticipant2 && message.receiver == chatParticipant1)){
                    message.date = dateNow;
                    chat.push(message);
                    messageAddedToArray = true;
                    //Check if chat with this person is open then add it 
                    if(document.getElementsByClassName('open-chat')[0] !== undefined && message.sender == document.getElementsByClassName('open-chat')[0].innerHTML){
                        addMessageToChat(message.sender, message.message, dateNow);
                    }
                }
            });
            if(!messageAddedToArray){
                location.reload();
            }
        });

        socket.on('notification', (notification) => {
            if(serviceWorkerExists){
                send("Notification: " + edittedType + ' from ' + sender);
            }
            var audio = new Audio('sounds/notification.mp3');
            audio.play();
            addNotification(notification.type, notification.sender, 'false');
        });

        socket.on('reconnecting', (data) => {
            console.log('reconnecting');
        });
        socket.on('reconnect', (data) => {
            console.log('reconnected');
        });    
    });

    var chatIcon = document.getElementById('chatIcon');
    var chatBox = document.getElementById('chatBox');
    var chatUsers = document.getElementById('chat-users');
    var chatInput = document.getElementById('chat-box-input');
    var counter = 1;

    chatIcon.addEventListener('click', () => {
        chatBox.classList.remove('hidden');
        chatUsers.classList.remove('hidden');
        if(counter % 2 == 0){
            chatBox.classList.remove('fadein');
            chatUsers.classList.remove('fadein');
            chatBox.classList.add('hide');
            chatUsers.classList.add('hide');
        }else{
            chatBox.classList.remove('hide');
            chatUsers.classList.remove('hide');
            chatBox.classList.add('fadein');
            chatUsers.classList.add('fadein');
        }
        counter++;
    },false);

    //Add chatPersons to chat-users
    var people = chatPeople.split(',');
    for(var i = 0; i < chatPeople.split(',').length; i++){
        var person = document.createElement('p');
        person.innerHTML = people[i];
        person.id = i;
        person.addEventListener('click', (e) => {
            var openChat = document.getElementsByClassName('open-chat');
            for(var i = 0; i < openChat.length; i++){
                openChat[i].classList.remove('open-chat');
            }
            e.srcElement.classList.add('open-chat');
            //Clear messages
            var chatBox = document.getElementById('chatBox');
            while(chatBox.firstChild){
                if(chatBox.firstChild.id != 'chat-box-message'){
                    chatBox.removeChild(chatBox.firstChild);
                }
                if(chatBox.childElementCount == 1){
                    break;
                }
            }
            //Add new chats messages
            var personID = Number(e.srcElement.id);
            var personsChats = allChatsGrouped[personID];
            personsChats.forEach((chat) => {
                addMessageToChat(chat.sender, chat.message, chat.date);
            });
        });
        chatUsers.appendChild(person);
    }

    //Add notifications to notification drop down
    allNotifications.forEach((notification) => {
        addNotification(notification.type, notification.sender, notification.seen);
    });

    //Reset notification counter onClick and 
     document.getElementById('notificationBtn').addEventListener('click', (e) => {
         var counter = document.getElementById('notification-counter');
         var oldCounterVal = parseInt(counter.innerHTML);
         if(!isNaN(oldCounterVal)){
            $.post('/notifications/readall', {
                'user': user
            });
         }
         counter.innerHTML = '';
     });

     document.getElementById('dropdownMenuLink').addEventListener('click', (e) => {
        var counter = document.getElementById('notification-counter');
         var oldCounterVal = parseInt(counter.innerHTML);
         if(!isNaN(oldCounterVal)){
            $.post('/notifications/readall', {
                'user': user
            });
         }
         counter.innerHTML = '';
     });

        
    }

    function appendYourMsg(){
        var today = new Date();
        var dateNow = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var message = document.getElementById('chat-box-input').value;
        addMessageToChat(user, message.trim(), getDateNow());
        document.getElementById('chat-box-input').value = ' ';
        //Get the receiver
        var receiver = document.getElementsByClassName('open-chat')[0].innerHTML;

        //Send message through socket
        socket.emit('send message', {
            'sender': user,
            'receiver': receiver,
            'message': message
        });

        //Add message to array of messages
        var sender = user;
        allChatsGrouped.forEach((chat) => {
            var chatParticipant1 = chat[0].sender;
            var chatParticipant2 = chat[0].receiver;
            if((sender == chatParticipant1 && receiver == chatParticipant2) || (sender == chatParticipant2 && receiver == chatParticipant1)){
                chat.push({'sender': user,
                            'receiver': receiver,
                            'message': message,
                            'date': dateNow});
                //Check if chat with this person is open then add it 
                var openChat = document.getElementsByClassName('open-chat')[0].innerHTML;
                if(sender == openChat){
                    addMessageToChat(sender, message, dateNow);
                }
                messageAddedToArray = true;
            }
        });
        if(!messageAddedToArray){
            location.reload();
        }
    }

    function addNotification(type, sender, seen){
        var notificationCounter = document.getElementById('notification-counter');
        var counterVal = parseInt(notificationCounter.innerHTML);
        if(isNaN(counterVal)){
            if(seen == 'false'){
                notificationCounter.innerHTML = 1;
            }
            document.getElementById('dropdown-placeholder').classList.add('hidden');
        }else{
            if(seen == 'false'){
                counterVal += 1;
                notificationCounter.innerHTML = counterVal;
            }
        }
        var notificationDropDown = document.getElementById('notifications-drop-down');
        var dropDownItem = document.createElement('a');
        var dropDownItemText = document.createElement('span');
        //Edit type
        var typeWithSpaces = type.split('_').join(' ');
        var edittedType = typeWithSpaces.charAt(0).toUpperCase() + typeWithSpaces.slice(1);
        dropDownItemText.innerHTML = edittedType + ' from ' + sender;
        dropDownItemText.classList.add('dropdown-notification-text');
        dropDownItem.appendChild(dropDownItemText);
        // dropDownItem.href = link;
        dropDownItem.classList.add('dropdown-item');
        dropDownItem.classList.add('dropdown-notification');
        notificationDropDown.appendChild(dropDownItem);
        // localStorage.setItem('notification', {'type':'message', 'sender': sender});
    }

    function addMessageToChat(sender, content, dateposted){
        var chatBox = document.getElementById('chatBox');
        var msgDiv = document.createElement('div');
        msgDiv.addEventListener('click', () => {
                // window.location.replace('/chat/<%= user.user_name %>/'+sender);
        });
        var msgSender = document.createElement('h6');
        var msgContent = document.createElement('p');
        var msgDate = document.createElement('span');
        //Adding classes to elements for styling purpose
        msgDiv.classList.add('chatMsg');
        msgDiv.classList.add('from-'+sender);
        msgDate.classList.add('date');
        msgSender.classList.add('msg-sender');
        //Adding content to elements 
        msgContent.innerHTML = content;
        msgSender.innerHTML = sender+': ';
        msgDate.innerHTML = 'Sent ' + dateposted;
        //Appending elements together in order
        msgDiv.appendChild(msgSender);
        msgDiv.appendChild(msgContent);
        // msgDiv.appendChild(msgDate);
        //Appending div to chatBox
        $("#chatBox").prepend(msgDiv);
    }

    function getDateNow(){
        var date =  new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        var timestamp = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"."+milliseconds;
        return timestamp;
    }
    $(document).ready(e => {
        if(typeof message !== 'undefined' && message.length != 0 && message != ' '){
            $('#modal').modal("show");
            setTimeout(() => {
                $('#modal').modal("hide");
            }, 2000);
        }
    });