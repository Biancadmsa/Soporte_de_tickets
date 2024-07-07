const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const pool = require("./db/db");
const helpers = require("handlebars-helpers")();
require("dotenv").config();

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

const SECRET = process.env.SECRET_KEY;

const autenticarToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded.usuario;
    next();
  } catch (err) {
    console.error("Error de autenticación:", err);
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  res.render("home", {
    cssFile: "home.css",
    title: "Sistema de Tickets para Soporte Técnico",
  });
});

app.get("/registro", (req, res) => {
  res.render("registro", {
    cssFile: "registro.css",
    title: "Registro de Usuario",
  });
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
    const token = jwt.sign({ usuario }, SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/success");
  } catch (err) {
    console.error("Error al registrar el usuario:", err);
    res.status(500).send("Error al registrar el usuario");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { cssFile: "login.css", title: "Iniciar Sesión" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    const usuario = resultado.rows[0];
    if (!usuario || password !== usuario.password) {
      return res
        .status(400)
        .send("Tu Usuario o contraseña son incorrectos o no estas registrado!");
    }
    const token = jwt.sign({ usuario }, SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/tickets");
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
    let resultado;
    if (req.usuario.tipo_usuario === "administrador") {
      // Recuperar todos los tickets para el administrador
      resultado = await pool.query(`
        SELECT tickets.*, usuarios.nombre AS nombre_usuario, tipos.nombre AS tipo
        FROM tickets
        JOIN usuarios ON tickets.id_usuario = usuarios.id
        JOIN tipos ON tickets.id_tipo = tipos.id
      `);
    } else {
      // Recuperar solo los tickets del usuario autenticado
      resultado = await pool.query(
        `
        SELECT tickets.*, usuarios.nombre AS nombre_usuario, tipos.nombre AS tipo
        FROM tickets
        JOIN usuarios ON tickets.id_usuario = usuarios.id
        JOIN tipos ON tickets.id_tipo = tipos.id
        WHERE tickets.id_usuario = $1
      `,
        [req.usuario.id]
      );
    }
    const tickets = resultado.rows;
    res.render("tickets", {
      cssFile: "tickets.css",
      title: "Tickets",
      tickets,
      usuario: req.usuario,
    });
  } catch (err) {
    console.error("Error al obtener tickets:", err);
    res.status(500).send("Error al obtener tickets");
  }
});

app.get("/ticket/nuevo", autenticarToken, (req, res) => {
  res.render("ticket_nuevo", {
    cssFile: "ticket_nuevo.css",
    title: "Crear Nuevo Ticket",
    usuario: req.usuario,
  });
});
app.post("/ticket/nuevo", autenticarToken, async (req, res) => {
  try {
    const { tipo, descripcion } = req.body;

    // Verificar si el tipo existe, si no, agregarlo
    let tipoResult = await pool.query(
      "SELECT id FROM tipos WHERE nombre = $1",
      [tipo]
    );
    if (tipoResult.rows.length === 0) {
      // Insertar nuevo tipo
      await pool.query("INSERT INTO tipos (nombre) VALUES ($1)", [tipo]);
      tipoResult = await pool.query("SELECT id FROM tipos WHERE nombre = $1", [
        tipo,
      ]);
    }
    const id_tipo = tipoResult.rows[0].id;

    // Insertar el nuevo ticket
    const resultado = await pool.query(
      "INSERT INTO tickets (descripcion, id_usuario, id_tipo) VALUES ($1, $2, $3) RETURNING *",
      [descripcion, req.usuario.id, id_tipo]
    );
    const ticket = resultado.rows[0];

    // Redirigir a la página de tickets
    res.redirect("/tickets");
  } catch (err) {
    console.error("Error al crear ticket:", err);
    res.status(500).send("Error al crear ticket");
  }
});

app.get("/ticket/:id", autenticarToken, async (req, res) => {
  const ticketId = req.params.id;
  try {
    const resultado = await pool.query(
      "SELECT tickets.*, usuarios.nombre AS nombre_usuario, tipos.nombre AS tipo FROM tickets JOIN usuarios ON tickets.id_usuario = usuarios.id JOIN tipos ON tickets.id_tipo = tipos.id WHERE tickets.id = $1 AND tickets.id_usuario = $2",
      [ticketId, req.usuario.id]
    );
    const ticket = resultado.rows[0];
    if (!ticket) {
      return res.status(404).send("Ticket no encontrado");
    }
    res.render("ticket_id", {
      cssFile: "ticket_id.css",
      title: "Detalle del Ticket",
      ticket,
      usuario: req.usuario,
    });
  } catch (err) {
    console.error("Error al obtener ticket:", err);
    res.status(500).send("Error al obtener ticket");
  }
});

app.get("/ticket/aleatorio", autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM tickets WHERE id_usuario = $1 ORDER BY RANDOM() LIMIT 1",
      [req.usuario.id]
    );
    const ticket = resultado.rows[0];
    if (!ticket) {
      return res.status(404).send("No se encontró ningún ticket");
    }
    res.render("ticket_id", {
      cssFile: "ticket_id.css",
      title: "Detalle del Ticket",
      ticket,
      usuario: req.usuario,
    });
  } catch (err) {
    console.error("Error al obtener ticket aleatorio:", err);
    res.status(500).send("Error al obtener ticket aleatorio");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
