// socket.js
module.exports = function(socketio) {
    socketio.on('connection', (socket) => {
        console.log('Un usuario se ha conectado');

        socket.on('sendMessage', (message) => {
            // Utiliza socketio.emit en lugar de io.emit
            socketio.emit('messageReceived', { message });
        });
    });
};
