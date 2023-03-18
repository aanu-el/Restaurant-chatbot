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
    4: 'Salad',
    55: 'Save order and go back to main menu'
}

// Socket.io events
io.on('connection', (socket) => {
    console.log(`a customer ${socket.id} connected`);

    let session = socket.id;
    sessions[session] = {}

    socket.emit('bot_msg', { message: "Welcome to Fave Restaurant!" });
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

            if (!(option in options)) {
                socket.emit('bot_error_msg', { message: "Invalid option! Please select a valid number from below" })
                socket.emit('bot_options', `${JSON.stringify(options)}`);
            }
            // Handle the requests
            switch (option) {
                case '1':
                    sessions[session].action = option;

                    socket.emit('bot_msg', { message: 'Please select all items to order:' });
                    socket.emit('bot_items', `${JSON.stringify(items)}`);

                    sessions[session].order = [];

                    socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                    break;
                case '99':
                    sessions[session].action = option;

                    if (sessions[session].order && sessions[session].order.length != 0) {
                        sessions[session].orders = sessions[session].orders || [];
                        sessions[session].orders.push(sessions[session].order);
                        sessions[session].order = null;
                        socket.emit('bot_msg', { message: 'Order placed successfully!' })
                        socket.emit('bot_msg', { message: 'Place a new order' });
                        socket.emit('bot_items', `${JSON.stringify(items)}`);

                        sessions[session].action = '1';

                        socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                    } else {
                        socket.emit('bot_msg', { message: 'No order found. Please place an order' });
                    }
                    break;
                case '97':
                    sessions[session].action = option;

                    if (sessions[session].order) {
                        socket.emit('bot_msg', { message: `Your current order is: ${sessions[session].order.join(', ')}` })

                        socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                    } else {
                        socket.emit('bot_msg', { message: 'No order found. Please place an order' });

                        socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                    }
                    break;
                case '98':
                    sessions[session].action = option;

                    if (sessions[session].orders) {
                        socket.emit('bot_msg', { message: 'Your order history:' })
                        socket.emit('bot_items', `${JSON.stringify(sessions[session].orders)}`);
                        socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                    } else {
                        socket.emit('bot_msg', { message: 'No order found.' });

                        // socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                    }
                    break;
                case '0':
                    sessions[session].action = option;

                    sessions[session].order = null;
                    socket.emit('bot_msg', { message: 'Order Cancelled!' })
                    socket.emit('bot_msg', { message: 'Create another Order by selecting an option below:' });
                    socket.emit('bot_items', `${JSON.stringify(items)}`);

                    sessions[session].action = '1';

                    socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
            }
        }
    })

    socket.on('selected_item', (data) => {
        if (session && sessions[session]) {
            const option = data;

            if (!(option in items)) {
                socket.emit('bot_error_msg', { message: "Invalid option! Please select a valid option" })
                socket.emit('bot_items', `${JSON.stringify(items)}`);
            }

            // Handle the item orders


            if (option == '1') {
                sessions[session].order.push('Pizza');
                socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                socket.emit('bot_msg', { message: 'Pizza Order Received' });
            }

            if (option == '2') {
                sessions[session].order.push('Burger');
                socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                socket.emit('bot_msg', { message: 'Burger Order Received' });
            }

            if (option == '3') {
                sessions[session].order.push('Fries');
                socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                socket.emit('bot_msg', { message: 'Fries Order Received' });
            }

            if (option == '4') {
                sessions[session].order.push('Salad');
                socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                socket.emit('bot_msg', { message: 'Salad Order Received' });
            }

            if (option == '55') {
                sessions[session].action = '';
                socket.emit('session_data', `${JSON.stringify(sessions[session])}`);
                socket.emit('bot_msg', { message: 'Order Saved! Returning to main menu' })
                socket.emit('bot_options', `${JSON.stringify(options)}`);
            }
        }
    })


});

server.listen(3000, () => {
    console.log('listening on *:3000');
});