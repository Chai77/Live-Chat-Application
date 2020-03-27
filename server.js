const express = require('express');
const app = express();
const http = require('http').Server(app);
const socket = require("socket.io");
const path = require('path')
const io = socket(http);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/public')));
let clients = 0;

io.on('connection', function(socket) {
    socket.on('NewClient', () => {
        if(clients < 2) {
            if(clients == 1) {
                this.emit('CreatePeer');
            }
        } else {
            this.emit('SessionActive');
        }
        clients++;
    })
    socket.on('Offer', sendOffer);
    socket.on('Answer', sendAnswer);
    socket.on('disconnect', disconnect);
})

function disconnect() {
    if(clients > 0) {
        clients--;
    }
}

function sendOffer(offer) {
    this.broadcast.emit("BackOffer", offer);
}


function sendAnswer(data) {
    this.broadcast.emit("BackAnswer", data);
}

http.listen(port, () => console.log(`Active on port ${port}`))