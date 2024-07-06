const { Pool } = require("pg");

const SECRET = process.env.SECRET;


require("dotenv").config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


pool
  .connect()
  .then(() => {
    console.log("Base de datos conectada");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = pool;