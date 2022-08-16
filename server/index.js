'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT || 3005;
const Game = require('./src/game.js')

const emissionMs = 500; // update clients every 1/2 second

server.listen(PORT, async () => {

    // initialize game connections and hooks
    const game = new Game(io);

    // start server emission
    setInterval(()=>{
        game.update();
    }, emissionMs);
})