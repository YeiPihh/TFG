//index.js
const express = require('express');
const session = require('express-session'); // <-- Añade esta línea
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const socketio = require('socket.io')(server);
const passport = require('passport');
require('./passport-config')(passport);

const mysql = require('mysql2/promise');

// conexion a la base de datos
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

async function getfriendRequestsData (userId) {
  try {
    // Realizar la consulta SQL para obtener todas las solicitudes de amistad para un usuario específico
    const [results] = await connection.query('SELECT friend_requests.*, users.username AS senderUsername FROM friend_requests JOIN users ON friend_requests.sender_id = users.id WHERE friend_requests.receiver_id = ?', [userId]);

    return results; // Esto devolverá un array de objetos, donde cada objeto representa una fila de la tabla
  } catch (error) {
    console.error('Error al obtener las solicitudes de amistad:', error);
    return [];
  }
}

async function getContactsForUser(userId) {
  try {
    const [results] = await connection.query('SELECT c.contact_id, u.username FROM contacts c JOIN users u ON c.contact_id = u.id WHERE c.user_id = ?', [userId]);

    for(let i = 0; i < results.length; i++) {
      const contact = results[i];
      const lastMessage = await getLastMessage(userId, contact.contact_id);
      contact.lastMessage = lastMessage[0] ? lastMessage[0].content : null;
    }

    return results;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    return [];
  }
}

async function getChatHistory(userId, contactId) {
  try {
    const [results] = await connection.query(
      'SELECT m.* FROM messages m WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) ORDER BY m.timestamp',
      [userId, contactId, contactId, userId]
    );
    return results;
  } catch (error) {
    console.error('Error al obtener el historial del chat:', error);
    return [];
  }
}

async function getLastMessage(userId, contactId) {
  try {
    const [results] = await connection.query(
      'select content from messages where ((receiver_id=? and sender_id=?) or (receiver_id=? and sender_id=?)) and timestamp = (select max(timestamp) from messages where ((receiver_id = ? AND sender_id = ?) OR (receiver_id = ? AND sender_id = ?)))',
      [userId, contactId, contactId, userId, userId, contactId, contactId, userId]
    );
    return results;
  } catch (error) {
    console.error('Error al obtener el ultimo mensaje del chat:', error);
    return [];
  }
}


app.set('view engine', 'ejs');

// Configurar la carpeta donde estarán tus vistas
app.set('views', path.join(__dirname, 'views'));



var registerRoute = require('./src/routes/registerRoute');
var loginRoute = require('./src/routes/loginRoute');
require('./socket.js')(socketio);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Configurar las sesiones ANTES de las rutas y Passport
app.use(session({
  secret: '020901',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si se usas usando HTTPS
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session()); // <-- asegurarse de que esta línea esté después de la configuración de session

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
}



app.use('/register', registerRoute);
app.use('/login', loginRoute);

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/chat', ensureAuthenticated, async (req, res) => {
  const user = {
    username: req.user.username,
    id: req.user.id // Aquí es donde se obtiene el ID del usuario desde la base de datos o sesión
  };
    
  const contacts = await getContactsForUser(user.id);
  res.render('chat', { user: user, contacts: contacts });
});

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/login');  // Redirecciona al usuario a la página de inicio de sesión
    });
});

app.get('/chat-history/:contactId', ensureAuthenticated, async (req, res) => {
  const contactId = req.params.contactId;
  const userId = req.user.id;

  // Aquí obtienes el historial del chat desde la base de datos
  const chatHistory = await getChatHistory(userId, contactId);

  res.json({ success: true, messages: chatHistory });
});

app.get('/friend-requests', ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const friendRequestsData = await getfriendRequestsData(userId);
  res.json({ success: true, friendRequests: friendRequestsData });
});


const port = process.env.PORT || 4560;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
