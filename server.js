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
