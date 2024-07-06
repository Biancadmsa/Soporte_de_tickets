const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const exphbs = require('express-handlebars');
const pool = require('./db/db');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public')); // Servir archivos estáticos desde 'public'

// Configurar el motor de plantillas Handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', exphbs.engine({ extname: 'hbs', defaultLayout: false }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const SECRET = process.env.SECRET;

// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static("public"));
// app.use("/static", express.static(path.join(__dirname, "src")));
// app.use("/src/css", express.static(path.join(__dirname, "src", "css")));



// Función auxiliar para autenticar JWT
const autenticarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send("No se encontró token");
  
    jwt.verify(token, SECRETO, (err, usuario) => {
      if (err) return res.status(403).send("Token no válido");
      req.usuario = usuario;
      next();
    });
  };


  // Función auxiliar para verificar rol de administrador
  const verificarAdmin = (req, res, next) => {
    if (req.usuario.tipo_usuario !== 'administrador') return res.status(403).send("No tiene permisos de administrador");
    next();
  };


// Ruta para mostrar la página de inicio de sesión
app.get('/lhome', (req, res) => {
    res.render('login');
  });


// Ruta para mostrar la página de inicio de sesión
app.get('/login', (req, res) => {
    res.render('login');
  });

// Rutas para registro y login de usuarios
app.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const resultado = await pool.query(
        'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING *',
        [nombre, email, hashedPassword]
      );
      res.json(resultado.rows[0]);
    } catch (err) {
      res.status(500).send("Error al registrar el usuario");
    }
  });



app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      const usuario = resultado.rows[0];
      if (!usuario) return res.status(400).send("Usuario no encontrado");
  
      if (await bcrypt.compare(password, usuario.password)) {
        const token = jwt.sign({ userId: usuario.id, tipo_usuario: usuario.tipo_usuario }, SECRETO);
        res.json({ token });
      } else {
        res.status(400).send("Contraseña incorrecta");
      }
    } catch (err) {
      res.status(500).send("Error al iniciar sesión");
    }
  });







// Ruta principal
app.get('/', (req, res) => {
    res.render('home', { title: 'Mi Home' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/registro', (req, res) => {
    res.render('registro');
});

app.get('/tickets', (req, res) => {
    // obtener la lista de tickets
    res.render('tickets', { tickets: [] });
});

app.get('/ticket/nuevo', (req, res) => {
    res.render('nuevo_ticket');
});

app.get('/ticket/:id', (req, res) => {
    const ticketId = req.params.id;
    // obtener los detalles del ticket
    res.render('detalle_ticket', { ticket: {} });
});



