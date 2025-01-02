//const app = require('./app');

const express = require('express');
const app = express();
const connection = require('./db'); // Importar la conexión a MySQL
const cors = require('cors'); // Importar cors
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// Usar cors para permitir solicitudes desde cualquier origen (o especificar un origen)
app.use(cors());
app.use(bodyParser.json());  // Asegúrate de que el cuerpo de la solicitud esté parseado como JSON

// Ruta para /api
app.get('/api', (req, res) => {
  res.json({
      message: 'Bienvenido a la API',
      status: 'success',
  });
});

// Ruta para obtener todos los juegos
app.get('/juegos', (req, res) => {
  const query = 'SELECT * FROM juegos'; // Consulta para obtener todos los juegos

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar los juegos: ', err);
      res.status(500).json({ error: 'Error en la consulta' });
      return;
    }

    res.json(results); // Enviar los resultados en formato JSON
  });
});

// Ruta para obtener un juego por su ID
app.get('/juegos/:id', (req, res) => {
  const juegoId = req.params.id;

  // Consulta SQL para obtener el juego por ID
  const query = 'SELECT * FROM juegos WHERE id = ?';
  connection.query(query, [juegoId], (err, results) => {
    if (err) {
      console.error('Error al consultar el juego:', err);
      return res.status(500).json({ error: 'Error al buscar el juego' });
    }

    // Si no se encuentra el juego, devolver un error
    if (results.length === 0) {
      return res.status(404).json({ error: 'juego no encontrado' });
    }

    // Si se encuentra el juego, devolverlo
    res.json(results[0]); // Enviar el primer juego encontrado
  });
});

// Ruta para crear un juego
app.post('/crearjuego', (req, res) => {
  const { nombre, descripcion } = req.body;

  // Verificar si el juego ya existe en la base de datos
  const queryCheckUser = 'SELECT * FROM juegos WHERE nombre = ?';

  connection.query(queryCheckUser, [nombre], (err, results) => {
    if (err) {
      console.error('Error al verificar el juego:', err);
      return res.status(500).json({ error: 'Error al verificar el juego' });
    }

    // Si el juego ya existe, devolver un conflicto
    if (results.length > 0) {
      return res.status(409).json({ mensaje: 'El juego ya existe.' });
    }

    // Validar que los datos necesarios estén presentes
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: 'El nombre de juego y la contraseña son requeridos' });
    }

    // Hash de la contraseña antes de almacenarla
    bcrypt.hash(descripcion, 10, (err, hasheddescripcion) => {
      if (err) {
        console.error('Error al generar el hash de la contraseña:', err);
        return res.status(500).json({ error: 'Error al guardar el juego' });
      }

      // Insertar el juego en la base de datos
      const queryInsertUser = 'INSERT INTO juegos (nombre, descripcion) VALUES (?, ?)';
      connection.query(queryInsertUser, [nombre, hasheddescripcion], (err, results) => {
        if (err) {
          console.error('Error al insertar juego:', err);
          return res.status(500).json({ error: 'Error al guardar el juego' });
        }

        const nuevojuego = {
          id: results.insertId,  // Obtiene el ID generado automáticamente por la base de datos
          nombre: nombre,
          descripcion: hasheddescripcion  // Asegúrate de que no devuelvas la contraseña en texto claro
        };

        // Enviar respuesta con el nuevo juego
        res.status(201).json(nuevojuego);
      });
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
