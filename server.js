const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db/db");
const helpers = require("handlebars-helpers")();
require("dotenv").config(); // Cargar variables de entorno

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: false,
    helpers,
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

const SECRET = process.env.SECRET_KEY; // Asegurar que se está utilizando la variable correcta

// Middleware para autenticar JWT
const autenticarToken = (req, res, next) => {
  const token = req.cookies.token; // Extraer el token de la cookie
  console.log("Token recibido:", token); // Log para depuración
  if (!token) {
    return res.status(401).send("Acceso denegado. No se proporcionó token.");
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded.usuario; // El objeto usuario se asigna correctamente
    next();
  } catch (err) {
    console.error("Error de autenticación:", err); // Log para depuración
    res.status(403).send("Token no válido");
  }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  console.log("Usuario autenticado:", req.usuario); // Log para depuración
  if (req.usuario.tipo_usuario.toLowerCase() !== "administrador") {
    return res.status(403).send("No tiene permisos de administrador");
  }
  next();
};

// Rutas para mostrar las páginas
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get('/registro', (req, res) => {
    res.render('registro');
});

app.get("/tickets", autenticarToken, verificarAdmin, (req, res) => {
  res.render("tickets", { tickets: [] });
});

app.get("/ticket/nuevo", autenticarToken, (req, res) => {
  res.render("ticket_nuevo");
});

app.get("/ticket/:id", autenticarToken, (req, res) => {
  const ticketId = req.params.id;
  // obtener los detalles del ticket
  res.render("ticket_id", { ticket: {} });
});
app.post("/registro", async (req, res) => {
    const { nombre, email, password, tipo_usuario } = req.body;
  
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
  
    try {
      const resultado = await pool.query(
        "INSERT INTO usuarios (nombre, email, password, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING *",
        [nombre, email, password, tipo_usuario || "usuario"]
      );
      const usuario = resultado.rows[0];
      console.log("Usuario registrado:", usuario);
  
      // Generar token JWT
      const token = jwt.sign({ usuario }, SECRET, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true });
  
      // Redirigir a la página de éxito
      res.redirect("/success");
    } catch (err) {
      console.error("Error al registrar el usuario:", err);
      res.status(500).send("Error al registrar el usuario");
    }
  });
  
  app.get("/success", (req, res) => {
    res.render("success");
  });
  
  
  app.get("/success", (req, res) => {
    res.render("success");
  });
  
app.get("/success", (req, res) => {
  res.send("Registro exitoso");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`Intento de inicio de sesión para el email: ${email}`); // Log de depuración
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    const usuario = resultado.rows[0];

    if (!usuario) {
      console.log("Usuario no encontrado"); // Log de depuración
      return res.status(400).send("Usuario no encontrado");
    }

    console.log("Usuario encontrado:", usuario); // Log de depuración

    if (password !== usuario.password) {
      console.log("Contraseña incorrecta"); // Log de depuración
      return res.status(400).send("Contraseña incorrecta");
    }

    // Generar token JWT
    const token = jwt.sign({ usuario }, SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });

    // Redirigir a la ruta /tickets después del inicio de sesión exitoso
    res.redirect("/tickets");
  } catch (err) {
    console.error("Error al iniciar sesión:", err); // Log de depuración
    res.status(500).send("Error al iniciar sesión");
  }
});

app.get("/tickets", autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM tickets");
    const tickets = resultado.rows;
    res.render("tickets", { tickets });
  } catch (err) {
    console.error("Error al obtener tickets:", err);
    res.status(500).send("Error al obtener tickets");
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
