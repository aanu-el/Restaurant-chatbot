const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Socket.io connection
const { Server } = require("socket.io");
const io = new Server(server);

// Initialize express app
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Store user session based on devices
const sessions = {};

// Options
const options = {
    1: 'Place an order',
    97: 'See current order',
    98: 'See order history',
    99: 'Checkout order',
    0: 'Cancel order'
};

// Restaurant items
const items = {
    1: 'Pizza',
    2: 'Burger',
    3: 'Fries',
    4: 'Salad'
}

// Socket.io events
io.on('connection', (socket) => {
    console.log(`a customer ${socket.id} connected`);

    let session = socket.id;
    sessions[session] = {}


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

        if (session && sessions[session]) {
            const option = data;
            // validate the input data
            if (!(option in options)) {
                socket.emit('bot_error_msg', { message: "Invalid option! Please select a valid number from below" })
                socket.emit('bot_options', `${JSON.stringify(options)}`);
            }

            // Handle the requests
            switch (option) {
                case '1':
                    socket.emit('bot_msg', { message: 'Please select an item to order:' });
                    socket.emit('bot_items', `${JSON.stringify(items)}`);
                    sessions[session].order = [];
                    break;
                case '99':
                    if (sessions[session].order && sessions[session].order.length != 0) {
                        sessions[session].orders = sessions[session].orders || [];
                        sessions[session].orders.push(sessions[session].order);
                        sessions[session].order = null;
                        socket.emit('bot_msg', { message: 'Order placed successfully!' })
                        socket.emit('bot_msg', { message: 'Please select an item to order:' });
                        socket.emit('bot_items', `${JSON.stringify(items)}`);

                    } else {
                        socket.emit('bot_msg', { message: 'No order found. Please place an order' });
                        socket.emit('bot_items', `${JSON.stringify(items)}`);
                    }
                    break;
                case '97':
                    if (sessions[session].order) {
                        socket.emit('bot_msg', { message: `Your current order is: ${sessions[session].order.join(', ')}` })
                    } else {
                        socket.emit('bot_msg', { message: 'No order found. Please place an order' });
                        socket.emit('bot_items', `${JSON.stringify(items)}`);
                    }
                    break;
                case '98':
                    if (sessions[session].orders) {
                        socket.emit('bot_msg', { message: 'Your order history:' })
                        socket.emit('bot_items', `${JSON.stringify(sessions[session].orders)}`);
                    } else {
                        socket.emit('bot_msg', { message: 'No order found.' });
                    }
                    break;
                case '0':
                    sessions[session].order = null;
                    socket.emit('bot_msg', { message: 'Order Cancelled!' })
                    socket.emit('bot_msg', { message: 'Create another Order by selecting an option below:' });
                    socket.emit('bot_items', `${JSON.stringify(items)}`);
            }
        }

        console.log(sessions)
    })


});

server.listen(3000, () => {
    console.log('listening on *:3000');
});