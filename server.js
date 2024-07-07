const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
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
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers,
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

const SECRET = process.env.SECRET_KEY; // Asegurar que se está utilizando la variable correcta

// Middleware para autenticar JWT
const autenticarToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded.usuario; // El objeto usuario se asigna correctamente
    next();
  } catch (err) {
    console.error("Error de autenticación:", err); // Log para depuración
    res.redirect("/login");
  }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  // console.log("Usuario autenticado:", req.usuario); // Log para depuración
  if (req.usuario.tipo_usuario.toLowerCase() !== "administrador") {
    return res.status(403).send("No tiene permisos de administrador");
  }
  next();
};

// Rutas para mostrar las páginas
app.get("/", (req, res) => {
  res.render("home", {
    cssFile: "home.css",
    title: "Sistema de Tickets para Soporte Técnico",
  });
});


app.get('/registro', (req, res) => {
  res.render('registro', { cssFile: "registro.css", title: "Registro de Usuario" });
});

app.post("/registro", async (req, res) => {
  const { nombre, email, password, tipo_usuario } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }
  const tipoUsuarioFinal = tipo_usuario || "cliente";
  try {
    const resultado = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, email, password, tipoUsuarioFinal]
    );
    const usuario = resultado.rows[0];

    const token = jwt.sign({ usuario }, SECRET, { expiresIn: "1h" }); // Generar token JWT
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/success"); // Redirigir a la página de éxito
  } catch (err) {
    console.error("Error al registrar el usuario:", err);
    res.status(500).send("Error al registrar el usuario");
  }
});


// 3. Inicio de Sesión (Acceso Público)

app.get("/login", (req, res) => {
  res.render("login", { cssFile: "login.css", title: "Iniciar Sesión" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const resultado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const usuario = resultado.rows[0];
    if (!usuario || password !== usuario.password) {
      return res.status(400).send("Usuario o contraseña incorrectos");
    }
    const token = jwt.sign({ usuario }, SECRET, { expiresIn: "1h" }); // Generar token JWT
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/tickets"); //Redirigir a la ruta
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    res.status(500).send("Error al iniciar sesión");
  }
});


app.get("/success", (req, res) => {
  res.render("success", { cssFile: "success.css", title: "Éxito" });
});


app.get("/tickets", autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM tickets WHERE id_usuario = $1", [req.usuario.id]);
    const tickets = resultado.rows;
    res.render("tickets", {
      cssFile: "tickets.css",
      title: "Tickets",
      tickets,
      usuario: req.usuario // Pasa el objeto usuario a la vista
    });
  } catch (err) {
    console.error("Error al obtener tickets:", err);
    res.status(500).send("Error al obtener tickets");
  }
});

app.get("/", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});









// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
