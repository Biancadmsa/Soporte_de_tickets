

# Sistema de Tickets para Soporte Técnico

 ```
Sistema de Tickets para Soporte Técnico es una herramienta diseñada para gestionar tickets y  resolver problemas técnicos de manera eficiente. Permite a los usuarios crear, rastrear y actualizar tickets de soporte, facilitando la comunicación entre clientes y el equipo de soporte. Ofrece una solución integral para asegurar la satisfacción del cliente y la optimización de los recursos técnicos.

 ```


## Tecnologías Utilizadas

 ```
- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework web para Node.js.
- **Handlebars**: Motor de plantillas para generar HTML dinámico.
- **PostgreSQL**: Sistema de gestión de bases de datos.
- **jsonwebtoken**: Para la autenticación basada en tokens JWT.
- **express-fileupload**: Para la carga de archivos.

 ```

## Configuración del Proyecto

### Requisitos Previos

 ```
- Node.js (v14 o superior)
- PostgreSQL

 ```

### Instalación

 ```
1. Abre la carpeta del proyecto: 

gestion_tickets.

 ```

 ```
2. Instala las dependencias:

npm install

 ```

3. Crea un archivo .env en la raíz del proyecto con el siguiente contenido:

 ```sql
DB_USER= (tu usuario de pg)
DB_HOST= 127.0.0.1
DB_DATABASE=skatepark
DB_PASSWORD=postgres(la clave de tu pg)
DB_PORT=5432 (tu puerto de pg)
SECRET_KEY=secretKey

 ```

4. Conectate a PostgreSQL:

 ```
psql -U tu_usuario

 ```

5. Crea la base de Datos

 ```sql
CREATE DATABASE gestion_tickets;

 ```
6. Cambia al contexto de la nueva base de datos: 

 ```
\c gestion_tickets;

 ```


7. Crea las tablas necesarias:
```sql
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

     -----HACER LOS SIGUIENTES INSERT

--Insertar datos semilla semilla-


INSERT INTO usuarios (nombre, email, password, tipo_usuario) VALUES
  ('Rodrigo', 'administrador@mail.com', 'Abc123#', 'administrador'), 
  ('Bianca', 'estudiante@mail.com', 'Abc123#', 'cliente');

-- Insertar valores para tipos de tickets

INSERT INTO tipos (nombre) VALUES ('Urgente'), ('Importante'), ('Neutro');

```

   
## Conecta postgres a tu Usuario:
```
psql -U tu_usuario
```


## Iniciar el servidor:

```bash
npm start
nodemon server.js
```

## Abrir un navegador y navegar a:
 ```
 `http://localhost:3000`, 
  para ver la aplicación en funcionamiento.

 ```

 
###Consultas SQL Útiles;
```sql
SELECT * FROM tipos;
SELECT * FROM tickets;
SELECT * FROM comentarios;
SELECT * FROM usuarios;
 ```

## Seguridad

 ```
- El sistema utiliza JSON Web Tokens (JWT) para la autenticación.
- Las rutas protegidas requieren un token JWT válido.

 ```