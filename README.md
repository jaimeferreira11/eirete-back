# Eirete Rest Api

## Desarollado con NodeJs, Express, MongoDB, Mongoose, Docker

## Sobre el proyecto

Aplicacion RestFull

- [Node.js](https://nodejs.org/en/) Como entorno de tiempo de ejecución para ejecutar JavaScript.
- [Express.js](https://expressjs.com/) Marco de servidor/capa de controlador
- [MongoDB](https://www.mongodb.com/) Base de datos
- [Mongoose](https://mongoosejs.com/) "ODM"/capa de modelo
- [Docker](https://www.docker.com/) Servicio contenedor para aislar el entorno.

## Preparar la aplicación

1. Instalar las dependencias

```
    npm install
```

2. Crear en la raíz el archivo `.env`. Configurar las variables de entorno referenciadas en `example.env`

- PORT: Puerto donde corre la aplicación
- MONGODB_CNN: Cadena de conexion a la base de datos
- SECRETORPRIVATEKEY: Valor semilla para generar las JWT Token, puede ser cualquier cadena.

## Ejecutar la aplicación

```
    node app.js
```

## Construir con Docker

1. Crear la imagen

```
    docker build -t eirete-rest-api:1.0 .
```

2. Ejecutar la aplicacion en el contenedor

```
   docker run  -p 8080:8080 --env-file ./.env  eirete-rest-api:1.0 
```

3. Comprobar que el contenedor esté corriendo

```
$ docker ps
```

## Logs en docker

```
$ docker logs <container id>
```

## Deploy in Ubuntu server

- Descargar el codigo desde el github

- Instalar las dependencias

  `npm install`

- Configurar las variables de entorno en el archivo `/.env`

- Configurar variables de entorno

```
  export MONGODB_CNN=
  export SECRETORPRIVATEKEY=
  export PORT=
```

- Intall pm2

  `sudo npm install pm2 -g`

- Hacer el build

  `npm run build`

- Correr la aplicacion

  `pm2 --name eirete-back start npm -- start`

- Guardar la configuracion

  `pm2 save`

- Configurar el autoinicio

  `pm2 startup`


## Documentación de las APIs

En el navegador:

- [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

## Estrucutura de la aplicación

- Los `assets` contiene los archivos estaticos
- Los `controllers` procesamiento de las logica de negocio y interacción con la base de datos
- Los `database` configuración de la base de datos
- Los `helpers` son funciones útiles de uso común para toda la aplicación .
- Los `models` son las definiciones de estuctura de la base de datos [Mongoose](https://mongoosejs.com/docs/guide.html)
- Los `routes` rutas declaradas que usan el [módulo express.Router](https://expressjs.com/en/guide/routing.html)
- Los `uploads` son los archivos subidos a la aplicacion por medio del API correspóndiente
- `app.js` archivo principal el que construye y corre la aplicación express
- `.env.` donde se configura las variables de entorno, por seguridad no tiene seguimiento de versiones.
  `.example.env` ejemplo de como se configura las variables de entorno
- `swagger-setup.js` archivo de configuracion del swagger

## Modelo de datos

[Diagrama ER](https://drive.google.com/file/d/1c6BLj0EeQhw-TbW2L9hf6ZOaz2mxmZNp/view?usp=sharing)

Imagen: `assets/documentation/modelo-ER.jpg`
