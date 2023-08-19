const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Cambia esto si tu servidor MySQL está en otro lugar
  user: 'root',      // Usuario de la base de datos (puede ser diferente)
  password: 'toor',
  database: 'dbChat'
});




module.exports = connection;