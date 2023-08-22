// socket.js
var mysql = require('mysql2/promise');


var connection;
mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'dbChat'
}).then(conn => {
    connection = conn;
}).catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
});

const userSockets = {};
const userIds = {};

module.exports = function(socketio) {
    socketio.on('connection', (socket) => {
        console.log('Un usuario se ha conectado');
        socket.on('registerUser', (data) => {
            userSockets[data.username] = socket;
            userIds[socket.id] = data.userId;
        });

        socket.on('sendMessage', async (messageData) => {
            // Insertar el mensaje en la base de datos
            await connection.query('INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, ?)', [messageData.senderId, messageData.receiverId, messageData.content, new Date()]);
      
            // Emitir el mensaje al destinatario si está en línea
            const receiverSocket = userSockets[messageData.receiverUsername];
            if (receiverSocket) {
              receiverSocket.emit('receiveMessage', messageData);
            }
          });
      
          socket.on('openChat', async (contactId) => {
            const userId = userIds[socket.id]; // Asumiendo que tienes una manera de obtener el userId
            const [messages] = await connection.query('SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp', [userId, contactId, contactId, userId]);
      
            // Enviar los mensajes al cliente
            socket.emit('chatHistory', messages);
          });


        socket.on('addContact', async (newContactUsername) => {
            const userId = userIds[socket.id]; // Obtener el ID del usuario actual
        
            try {
                // Buscar el ID del nuevo contacto en la base de datos
                const [results] = await connection.query('SELECT id FROM users WHERE username = ?', [newContactUsername]);
                const contactId = results[0].id;
        
                // Comprobar si ya existe una fila con este user_id y contact_id
                const [existingContact] = await connection.query('SELECT * FROM contacts WHERE user_id = ? AND contact_id = ?', [userId, contactId]);
                
                if (existingContact.length > 0) {
                    console.log('El contacto ya existe, no se agregará nuevamente.');
                    return; // Salir temprano si el contacto ya existe
                }
        
                // Insertar el nuevo contacto en la tabla 'contacts'
                await connection.query('INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)', [userId, contactId]);
                console.log('Contacto añadido exitosamente');
            } catch (error) {
                console.error('Error al agregar contacto:', error);
            }
        });
        
        

    });
};
