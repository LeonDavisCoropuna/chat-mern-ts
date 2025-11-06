FROM node:20.11.1-alpine3.19 AS build

WORKDIR /app

# Argumentos de build para variables de entorno
ARG VITE_API_URL=/api
ARG NODE_ENV=production

COPY package.json ./
COPY package-lock.json* ./
COPY vite.config.ts ./

# Instalar TODAS las dependencias (incluyendo devDependencies) 
# Forzar instalación de devDependencies incluso en producción
RUN npm ci --include=dev

ENV PATH="/app/node_modules/.bin:$PATH"

# Establecer variables de entorno DESPUÉS de instalar dependencias
ENV VITE_API_URL=$VITE_API_URL \
    NODE_ENV=$NODE_ENV

COPY . .

RUN npm run build

FROM nginx:1.25.4-alpine3.18

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/

EXPOSE 3000

ENTRYPOINT ["nginx","-g","daemon off;"]
