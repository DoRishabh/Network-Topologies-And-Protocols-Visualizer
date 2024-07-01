const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('simulate attack', () => {
        io.emit('attack simulated');
    });
    socket.on('deploy security measure', () => {
        io.emit('security measure deployed');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
