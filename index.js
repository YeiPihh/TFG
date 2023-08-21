const express = require('express');
const session = require('express-session'); // <-- Añade esta línea
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const socketio = require('socket.io')(server);
const passport = require('passport');
require('./passport-config')(passport);


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
app.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('chat', {user: req.user});
});
app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/login');  // Redirecciona al usuario a la página de inicio de sesión
    });
});






server.listen(3476, () => {
    console.log('Server running on port 3000');
});
