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

async function getContactsForUser(userId) {
  try {
    const [results] = await connection.query('SELECT c.contact_id, u.username FROM contacts c JOIN users u ON c.contact_id = u.id WHERE c.user_id = ?', [userId]);
    return results;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    return [];
  }
}

async function getChatHistory(userId, contactId) {
  try {
    // Ajusta esta consulta según tus necesidades
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










app.set('view engine', 'ejs');

// Configurar la carpeta donde estarán tus vistas
app.set('views', path.join(__dirname, 'views'));



var registerRoute = require('./src/routes/registerRoute');
var loginRoute = require('./src/routes/loginRoute');
require('./socket.js')(socketio);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Configura las sesiones ANTES de las rutas y Passport
app.use(session({
  secret: '020901',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si estás usando HTTPS
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session()); // <-- Asegúrate de que esta línea esté después de la configuración de session

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
        id: req.user.id // Aquí es donde obtienes el ID del usuario desde tu base de datos o sesión
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
    const userId = req.user.id; // Suponiendo que tengas el ID del usuario en req.user
  
    // Aquí debes obtener el historial del chat desde la base de datos
    const chatHistory = await getChatHistory(userId, contactId);
  
    res.json({ success: true, messages: chatHistory });
  });
  





server.listen(3476, () => {
    console.log('Server running on port 3476');
});
