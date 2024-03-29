import React, { useEffect, useState } from 'react'
import { user } from "../Join/Join";
import socketIo from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../Images/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeIcon from "../../Images/closeIcon.png";

var socket;


const ENDPOINT = "http://localhost:4500/";
// const ENDPOINT = "https://webapp-chatify-it14nsw5z-ankur-saxenas-projects.vercel.app/";
const Chat = () => {
    const [id, setId] = useState("");
    const [messages, setMessages] = useState([]);

    const send = () => {
        const message = document.getElementById('chatInput').value;
        socket.emit('message', { message, id });
        document.getElementById('chatInput').value = "";
    }

    useEffect(() => {
        // Connect to the server
        socket = socketIo(ENDPOINT, { transports: ['websocket'] });
      
        socket.on('connect', () => {
          
            setId(socket.id);
        });
      
        // Emit 'joined' event
        socket.emit('joined', { user });
      
        // Listen for 'welcome', 'userJoined', and 'leave' events
        socket.on('welcome', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message);
        });
      
        socket.on('userJoined', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message);
        });
      
        socket.on('leave', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message);
        });
      
        // Listen for 'sendMessage' event
        socket.on('sendMessage', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message, data.id);
        });
      
        // Clean up on unmount
        return () => {
            // Properly disconnect from the server
            if (socket) {
                socket.disconnect();
            }
        };
    }, []); // Run this effect only once on component mount
    // Run this effect only once on component mount
   // Run this effect only once on component mount

    useEffect(() => {
        // Listen for 'sendMessage' event
        socket.on('sendMessage', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message, data.id);
        });

        // Clean up on unmount
        return () => {
            socket.off('sendMessage'); // Remove the listener
        };
    }, [messages]); // Run this effect whenever 'messages' changes

    return (
        <div className="chatPage">
            <div className="chatContainer">
                <div className="header">
                    <h2>CHATIFY</h2>
                    <a href="/"> <img src={closeIcon} alt="Close" /></a>
                </div>
                <ReactScrollToBottom className="chatBox">
                    {messages.map((item, i) => <Message key={i} user={item.id === id ? '' : item.user} message={item.message} classs={item.id === id ? 'right' : 'left'} />)}
                </ReactScrollToBottom>
                <div className="inputBox">
                    <input onKeyDown={(event) => event.key === 'Enter' ? send() : null} type="text" id="chatInput" />
                    <button onClick={send} className="sendBtn"><img src={sendLogo} alt="Send" /></button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
