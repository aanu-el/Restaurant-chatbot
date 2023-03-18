const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Socket.io connection
const { Server } = require("socket.io");
const io = new Server(server);


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

    socket.emit('bot_msg', { message: "Welcome to Fave's Restaurant!" });
    socket.emit('bot_msg', { message: "Please select an option below:" })
    socket.emit('bot_options', `${JSON.stringify(options)}`);


    socket.on("disconnect", () => {
        console.log("client disconnected", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("client disconnected", socket.id);
    });

    socket.on('selected_options', (data) => {
        console.log("Customer options: ", data);

        // validate the input data
        if (!(data in options)) {
            socket.emit('bot_error_msg', { message: "Invalid option! Please select a valid number from below" })
            socket.emit('bot_options', `${JSON.stringify(options)}`);
        }

        // Handle the requests
        
    })


});

server.listen(3000, () => {
    console.log('listening on *:3000');
});