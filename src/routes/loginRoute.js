var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise'); // Usa la versión promisificada para async/await
var { check, validationResult } = require('express-validator');

// Crea la conexión a la base de datos
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


router.post('/', async function(req, res) {
    const { username, password } = req.body;

    try {
        // Comprueba si el usuario existe y la contraseña es correcta
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            // Si el usuario existe y la contraseña es correcta, envía una respuesta positiva
            return res.status(200).json({ message: 'Logged in successfully' });
        } else {
            // Si el usuario no existe o la contraseña no es correcta, envía una respuesta negativa
            return res.status(400).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;