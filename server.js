const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('hbs', exphbs.engine({ extname: 'hbs', defaultLayout: false }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));


app.use(express.static("public"));
app.use("/static", express.static(path.join(__dirname, "src")));
app.use("/src/css", express.static(path.join(__dirname, "src", "css")));


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



