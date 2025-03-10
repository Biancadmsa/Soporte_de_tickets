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
const Handlebars = require("handlebars");

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET_KEY;



const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


Handlebars.registerHelper("formatDate", function (dateString) {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const date = new Date(dateString);
  return date.toLocaleString("es-ES", options);
});


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

app.post("/api/tickets", autenticarToken, async (req, res) => {
  try {
    const { tipo, descripcion } = req.body;

    let tipoResult = await pool.query(
      "SELECT id FROM tipos WHERE nombre = $1",
      [tipo]
    );
    if (tipoResult.rows.length === 0) {
      await pool.query("INSERT INTO tipos (nombre) VALUES ($1)", [tipo]);
      tipoResult = await pool.query("SELECT id FROM tipos WHERE nombre = $1", [
        tipo,
      ]);
    }
    const id_tipo = tipoResult.rows[0].id;

    const resultado = await pool.query(
      "INSERT INTO tickets (descripcion, id_usuario, id_tipo) VALUES ($1, $2, $3) RETURNING *",
      [descripcion, req.usuario.id, id_tipo]
    );
    const ticket = resultado.rows[0];
    res.status(201).json(ticket);
  } catch (err) {
    console.error("Error al crear ticket:", err);
    res.status(500).send("Error al crear ticket");
  }
});

app.get("/api/tickets", autenticarToken, async (req, res) => {
  try {
    let query = `
      SELECT tickets.*, usuarios.nombre AS nombre_usuario, tipos.nombre AS tipo
      FROM tickets
      JOIN usuarios ON tickets.id_usuario = usuarios.id
      JOIN tipos ON tickets.id_tipo = tipos.id
    `;
    let queryParams = [];

    if (req.usuario.tipo_usuario !== "administrador") {
      query += " WHERE tickets.id_usuario = $1";
      queryParams.push(req.usuario.id);
    } else {
      query += " WHERE 1=1";
    }

    const resultado = await pool.query(query, queryParams);
    const tickets = resultado.rows;
    res.status(200).json(tickets);
  } catch (err) {
    console.error("Error al obtener tickets:", err);
    res.status(500).send("Error al obtener tickets");
  }
});

app.get("/api/tickets/:id", autenticarToken, async (req, res) => {
  const ticketId = req.params.id;
  try {
    const ticketResult = await pool.query(
      "SELECT tickets.*, usuarios.nombre AS nombre_usuario, tipos.nombre AS tipo FROM tickets JOIN usuarios ON tickets.id_usuario = usuarios.id JOIN tipos ON tickets.id_tipo = tipos.id WHERE tickets.id = $1",
      [ticketId]
    );
    const comentariosResult = await pool.query(
      "SELECT comentarios.*, usuarios.nombre AS nombre_usuario FROM comentarios JOIN usuarios ON comentarios.id_usuario = usuarios.id WHERE comentarios.id_ticket = $1 ORDER BY comentarios.id",
      [ticketId]
    );

    const ticket = ticketResult.rows[0];
    const comentarios = comentariosResult.rows;

    if (!ticket) {
      return res.status(404).send("Ticket no encontrado");
    }

    res.status(200).json({ ticket, comentarios });
  } catch (err) {
    console.error("Error al obtener ticket:", err);
    res.status(500).send("Error al obtener ticket");
  }
});

app.post("/ticket/:id/comentario", autenticarToken, async (req, res) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).send("ID del ticket no válido");
  }
  const { mensaje, auditado } = req.body;

  try {
    await pool.query(
      "INSERT INTO comentarios (id_ticket, id_usuario, mensaje, fecha_creacion) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
      [ticketId, req.usuario.id, mensaje]
    );

    if (req.usuario.tipo_usuario === "administrador" && auditado === "true") {
      await pool.query("UPDATE tickets SET auditado = $1 WHERE id = $2", [
        true,
        ticketId,
      ]);
    }

    // Redirigir al cliente a la página del ticket
    res.redirect(`/ticket/${ticketId}`);
  } catch (err) {
    console.error("Error al agregar comentario:", err);
    res
      .status(500)
      .json({ success: false, error: "Error al agregar comentario" });
  }
});

// frontend

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
  const { tipo, fecha } = req.query;
  try {
    const tiposResult = await pool.query("SELECT * FROM tipos");
    const tipos = tiposResult.rows;

    let query = `
      SELECT tickets.*, usuarios.nombre AS nombre_usuario, tipos.nombre AS tipo
      FROM tickets
      JOIN usuarios ON tickets.id_usuario = usuarios.id
      JOIN tipos ON tickets.id_tipo = tipos.id
    `;
    let queryParams = [];

    if (req.usuario.tipo_usuario !== "administrador") {
      query += " WHERE tickets.id_usuario = $1";
      queryParams.push(req.usuario.id);
    } else {
      query += " WHERE 1=1";
    }

    if (tipo) {
      queryParams.push(tipo);
      query += ` AND tipos.nombre = $${queryParams.length}`;
    }

    if (fecha) {
      queryParams.push(fecha);
      query += ` AND DATE(tickets.fecha_creacion) = $${queryParams.length}`;
    }

    const resultado = await pool.query(query, queryParams);
    const tickets = resultado.rows;

    res.render("tickets", {
      cssFile: "tickets.css",
      title: "Tickets",
      tickets,
      tipos,
      usuario: req.usuario,
      esAdministrador: req.usuario.tipo_usuario === "administrador",
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
    const resultado = await pool.query(
      "INSERT INTO tickets (descripcion, id_usuario, id_tipo) VALUES ($1, $2, $3) RETURNING *",
      [req.body.descripcion, req.usuario.id, id_tipo]
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
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).send("ID del ticket no válido");
  }

  try {
    const ticketResult = await pool.query(
      "SELECT tickets.*, usuarios.nombre AS nombre_usuario, tipos.nombre AS tipo FROM tickets JOIN usuarios ON tickets.id_usuario = usuarios.id JOIN tipos ON tickets.id_tipo = tipos.id WHERE tickets.id = $1",
      [ticketId]
    );
    const comentariosResult = await pool.query(
      "SELECT comentarios.*, usuarios.nombre AS nombre_usuario, comentarios.fecha_creacion FROM comentarios JOIN usuarios ON comentarios.id_usuario = usuarios.id WHERE comentarios.id_ticket = $1 ORDER BY comentarios.id",
      [ticketId]
    );

    const ticket = ticketResult.rows[0];
    const comentarios = comentariosResult.rows;

    if (!ticket) {
      return res.status(404).send("Ticket no encontrado");
    }

    res.render("ticket_id", {
      cssFile: "ticket_id.css",
      title: "Detalle del Ticket",
      ticket,
      comentarios,
      usuario: req.usuario,
      esAdministrador: req.usuario.tipo_usuario === "administrador",
    });
  } catch (err) {
    console.error("Error al obtener ticket:", err);
    res.status(500).send("Error al obtener ticket");
  }
});

app.post("/ticket/:id/comentario", autenticarToken, async (req, res) => {
  const ticketId = req.params.id;
  const { mensaje, auditado } = req.body;

  try {
    await pool.query(
      "INSERT INTO comentarios (id_ticket, id_usuario, mensaje, fecha_creacion) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
      [ticketId, req.usuario.id, mensaje]
    );

    if (req.usuario.tipo_usuario === "administrador" && auditado === "true") {
      await pool.query("UPDATE tickets SET auditado = $1 WHERE id = $2", [
        true,
        ticketId,
      ]);
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error al agregar comentario:", err);
    res
      .status(500)
      .json({ success: false, error: "Error al agregar comentario" });
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
  res.status(500).send("Alggo esta mal!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
