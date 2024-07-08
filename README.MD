
npm install dotenv express express-handlebars handlebars jsonwebtoken express-fileupload body-parser cookie-parser uuid handlebars-helpers nodemon --save-dev

# Skate Park Registration System

Este es un sistema de registro de participantes para un skatepark. Los participantes pueden registrarse, iniciar sesión, modificar sus datos, y un administrador puede aprobar o eliminar participantes.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework web para Node.js.
- **Handlebars**: Motor de plantillas para generar HTML dinámico.
- **PostgreSQL**: Sistema de gestión de bases de datos.
- **jsonwebtoken**: Para la autenticación basada en tokens JWT.
- **express-fileupload**: Para la carga de archivos.

## Configuración del Proyecto

### Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL

### Instalación

1. Clonar el repositorio:

    ```bash
    git clone https://github.com/Biancadmsa/Skate_Park.git
    cd Skate_Park
    ```

2. Instalar las dependencias:

    ```bash
    npm install
    ```

3. Configurar la base de datos:

```sql
    - Crear una base de datos en PostgreSQL.
    - Crear las tablas necesarias ejecutando los siguientes comandos SQL:

     
      
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
  fecha_modificacion SET DEFAULT CURRENT_TIMESTAMP;
  id_usuario INT NOT NULL,
  id_tipo INT NOT NULL,
  auditado BOOLEAN DEFAULT false,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_tipo) REFERENCES tipos(id)
);


CREATE TABLE comentarios (
id SERIAL PRIMARY KEY,
mensaje TEXT NOT NULL,
id_usuario INT NOT NULL,
id_ticket INT NOT NULL,
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
FOREIGN KEY (id_ticket) REFERENCES tickets(id)
);

     -----HACER LOS SIGUIENTES INSERT-----
     
-- Insertar datos semilla
INSERT INTO usuarios (nombre, email, password, tipo_usuario) VALUES
  ('Rodrigo', 'administrador@mail.com', 'Abc123#', 'administrador'), 
  ('Bianca', 'estudiante@mail.com', 'Abc123#', 'cliente');

--  Insertar valores para tipos de tickets
INSERT INTO tipos (nombre) VALUES ('Urgente'), ('Importante'), ('Neutro');


 ```

4. Crear un archivo  `.env` en la raíz del proyecto con el siguiente contenido:

  ```
DB_USER= (tu usuario de pg)
DB_HOST= 127.0.0.1
DB_DATABASE=skatepark
DB_PASSWORD=postgres(la clave de tu pg)
DB_PORT=5432 (tu puerto de pg)
SECRET_KEY=secretKey

```
   
### Ejecución

1. Iniciar el servidor:

```bash
npm start
```

2. Abrir un navegador y navegar a:
 ```
 `http://localhost:3000`, 
  para ver la aplicación en funcionamiento.

 ```

3. Email y clave del administrador, fueron agregados con un insert, anteriormente indicados.
```
email: admin@skatepark
clave: admin123
```

## Rutas Principales

### Registro y Login

- `GET /register`: Muestra el formulario de registro.
- `POST /register`: Maneja el envío del formulario de registro.
- `GET /login`: Muestra el formulario de login.
- `POST /login`: Maneja el envío del formulario de login.

### Participantes

- `GET /`: Muestra todos los participantes registrados.
- `GET /profile`: Muestra el perfil del participante autenticado.
- `POST /profile`: Maneja la actualización de los datos del participante autenticado.

### Administrador

- `GET /admin`: Muestra la vista de administrador con todos los participantes registrados.
- `GET /approve/:id`: Aprueba a un participante.
- `GET /delete/:id`: Redirige a la vista de confirmación de eliminación.
- `POST /delete/:id`: Maneja la eliminación de un participante.

## Seguridad

- El sistema utiliza JSON Web Tokens (JWT) para la autenticación.
- Las rutas protegidas requieren un token JWT válido.
