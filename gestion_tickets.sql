-- Active: 1713566143574@@127.0.0.1@5432@gestion_tickets

\c gestion_tickets;

CREATE DATABASE gestion_tickets;

CREATE TABLE usuarios (
id SERIAL PRIMARY KEY,
nombre VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
tipo_usuario VARCHAR(50) DEFAULT 'cliente' NOT NULL
);

CREATE TABLE tipos (
id SERIAL PRIMARY KEY,
nombre VARCHAR(255) NOT NULL
);

CREATE TABLE tickets (
id SERIAL PRIMARY KEY,
descripcion TEXT NOT NULL,
fecha_creacion DATE DEFAULT CURRENT_DATE,
fecha_modificacion DATE,
id_usuario INT NOT NULL,
id_tipo INT NOT NULL,
FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
FOREIGN KEY (id_tipo) REFERENCES tipos(id)
);

CREATE TABLE comentarios (
id SERIAL PRIMARY KEY,
mensaje TEXT NOT NULL,
id_usuario INT NOT NULL,
id_ticket INT NOT NULL,
FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
FOREIGN KEY (id_ticket) REFERENCES tickets(id)
);



SELECT * FROM tipos;
SELECT * FROM tickets;
SELECT * FROM comentarios;
SELECT * FROM usuarios;


-- Insertar datos semilla
INSERT INTO usuarios (nombre, email, password, tipo_usuario) VALUES
  ('Rodrigo', 'administrador@mail.com', 'Abc123#', 'administrador'), 
  ('Bianca', 'estudiante@mail.com', 'Abc123#', 'estudiante');



DELETE FROM usuarios WHERE id > 2;

UPDATE usuarios SET tipo_usuario = 'cliente' WHERE id = 2;
