const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Socket.io connection
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Options
const options = {
    1: 'Place an order',
    97: 'See current order',
    98: 'See order history',
    99: 'Checkout order',
    0: 'Cancel order'
};

const items = {
    1: 'Pizza',
    2: 'Burger',
    3: 'Fries',
    4: 'Salad'
}

io.on('connection', (socket) => {
    console.log(`a customer ${socket.id} connected`);

    socket.emit('bot_welcome_msg', { message: "Welcome to Fave's Restaurant!" });
    socket.emit('bot_options_msg', { message: "Please select an option below:" })
    socket.emit('bot_options', `${JSON.stringify(options)}`);

    socket.on('customerOptions', (data) => {
        console.log("Customer options", data);

        
    })


});

server.listen(3000, () => {
    console.log('listening on *:3000');
});