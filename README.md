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

3. Añade las variables de entorno en un archivo `.env` en la raíz del proyecto, con el siguiente contenido:

```bash
PORT=5000
NODE_ENV=prod
MONGO_DB_URI=mongo_db_url/database
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost
```

4. Navega al directorio `frontend` y crea un archivo `.env` con el siguiente contenido:

```bash
VITE_API_URL=http://localhost:5000
```

5. Ejecuta el siguiente comando para iniciar la aplicación:

```bash
docker compose up
```

Esto iniciará los contenedores necesarios para ejecutar la aplicación.

## Uso

Una vez que la aplicación se haya iniciado correctamente, puedes acceder a ella desde tu navegador web visitando `http://localhost:3000`.