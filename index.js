const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const socketio = require('socket.io')(server);

var registerRoute = require('./src/routes/registerRoute');
var loginRoute = require('./src/routes/loginRoute');

// Importa y ejecuta la función del archivo socket.js
require('./socket.js')(socketio);
//files
app.use(express.static(path.join(__dirname, 'public')));



/*log in y registro */
const bodyParser = require('body-parser'); // Ejemplo de middleware para parsear el cuerpo de las solicitudes

// Configuración de middleware
app.use(bodyParser.urlencoded({ extended: true })); // Middleware para parsear datos del formulario


app.use(express.json());


// Resto de la configuración y middleware

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


app.use('/register', registerRoute);
app.use('/login', loginRoute);


app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});
app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});








server.listen(3000, () => {
    console.log('Server running on port 3000');
});