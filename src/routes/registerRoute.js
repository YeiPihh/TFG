var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise'); // Usa la versión promisificada para async/await
var { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const url = require('url');

/*const clearDBUrl = process.env.CLEARDB_DATABASE_URL; // URL de ClearDB de Heroku
const parsedUrl = url.parse(clearDBUrl);
const [username, password] = parsedUrl.auth.split(':');*/


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

router.post('/', [
    // Validación de los datos del usuario
    check('username', 'Username is required').notEmpty(),
    check('password', 'Password is required').notEmpty()
], async function(req, res) {
    // Comprueba los resultados de la validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Si hay errores de validación, envía una respuesta con los errores
        return res.status(400).json({ errors: errors.array() });
    }

    // Si los datos son válidos, intenta crear un nuevo usuario
    try {
        const { username, password } = req.body;
        
        // Comprueba si el usuario ya existe
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Crea un nuevo usuario y hashea la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ msg: 'User registered successfully' });
        

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

    console.log(`Un nuevo usuario se ha registrado: ${req.body.username}`);

});

module.exports = router;