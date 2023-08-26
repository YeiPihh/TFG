// socket.js
var mysql = require('mysql2/promise');
const url = require('url');

/*const clearDBUrl = process.env.CLEARDB_DATABASE_URL; // URL de ClearDB de Heroku
const parsedUrl = url.parse(clearDBUrl);
const [username, password] = parsedUrl.auth.split(':');*/


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


async function saveMessage(senderId, contactId, content) {
    try {
      await connection.query('INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())', [senderId, contactId, content]);
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
    }
}


const userSockets = {};
const userIds = {};

module.exports = function(socketio) {
    socketio.on('connection', (socket) => {
        console.log('Un usuario se ha conectado');
        socket.on('registerUser', (data) => {
            userSockets[data.userId] = socket;
            userIds[socket.id] = data.userId;
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
        
                // Verificar si existe tal usuario
                if (results.length === 0) {
                    console.error('Usuario no encontrado');
                    socket.emit('addContactError', 'Usuario no encontrado'); // Informar al cliente
                    return;
                }
        
                const contactId = results[0].id;
        
                // Comprobar si ya existe una fila con este user_id y contact_id
                const [existingContact] = await connection.query('SELECT * FROM contacts WHERE user_id = ? AND contact_id = ?', [userId, contactId]);
        
                if (existingContact.length > 0) {
                    console.log('El contacto ya existe, no se agregará nuevamente.');
                    socket.emit('addContactError', 'El contacto ya existe'); // Informar al cliente
                    return;
                }
        
                // Insertar el nuevo contacto en la tabla 'contacts'
                await connection.query('INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)', [userId, contactId]);
                console.log('Contacto añadido exitosamente');
                socket.emit('addContactSuccess', 'Contacto añadido exitosamente'); // Informar al cliente
            } catch (error) {
                console.error('Error al agregar contacto:', error);
                socket.emit('addContactError', 'Error al agregar contacto'); // Informar al cliente
            }
            

        });
        

        socket.on('sendMessage', async (data) => {
            
            const { senderId, receiverId, content } = data;
            console.log('socket',receiverId);
            await saveMessage(senderId, receiverId, content);
          
            // Puedes reenviar el mensaje al destinatario si es necesario
            // socket.to(receiverId).emit('receiveMessage', content);

            const receiverSocket = userSockets[receiverId]; // Asegúrate de tener una forma de obtener el socket del destinatario
            if (receiverSocket) {
              receiverSocket.emit('receiveMessage', data);
            }

          });
          
        
        

    });
};
