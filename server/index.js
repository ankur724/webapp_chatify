const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const port = process.env.PORT || 4500;

// Initialize users object
const users = {};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "chatify", "build")));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "chatify", "build", "index.html"));
    }); 
}

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({ user }) => {
        users[socket.id] = user;
        console.log(`${user} has joined `);
        socket.broadcast.emit('userJoined', { user: "Admin", message: ` ${users[socket.id]} has joined` });
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${users[socket.id]} ` });
    });

    socket.on('message', ({ message, id }) => {
        const sender = users[socket.id];
        io.emit('sendMessage', { user: sender, message, id });
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            delete users[socket.id];
            socket.broadcast.emit('leave', { user: "Admin", message: `${user} has left` });
            console.log(`${user} has left`);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
