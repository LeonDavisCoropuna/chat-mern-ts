# Proyecto Chat en Tiempo Real MERN APP con Nginx y Docker

## Instalación

1. Clona este repositorio en tu máquina local:

```bash
git clone https://github.com/LeonDavisCoropuna/chat-mern-ts.git
```

2. Navega al directorio del proyecto:

```bash
cd chat-mern-ts
```

3. Crea los archivos de variables de entorno:

* Dentro del directorio **backend**, crea un archivo `.env` con el siguiente contenido:

```bash
PORT=5000
NODE_ENV=development
MONGO_DB_URI=mongodb://admin:secret@mongo:27017/chat-app-db?authSource=admin
JWT_SECRET=supersecretkey
FRONTEND_URL=http://localhost
```

* Dentro del directorio **frontend**, crea un archivo `.env` con el siguiente contenido:

```bash
VITE_API_URL=http://localhost:5000
```

4. Ejecuta el siguiente comando para iniciar la aplicación:

```bash
docker compose up
```

Esto iniciará los contenedores necesarios para ejecutar la aplicación.

## Uso

Una vez que la aplicación se haya iniciado correctamente, puedes acceder a ella desde tu navegador web visitando `http://localhost`.