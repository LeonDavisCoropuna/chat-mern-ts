FROM node:20.11.1-alpine3.19 AS build

WORKDIR /app

# Argumentos de build para variables de entorno
ARG VITE_API_URL=/api
ARG NODE_ENV=production

# Establecer variables de entorno para el build
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

COPY package.json ./
COPY vite.config.ts ./

RUN npm install

ENV PATH /app/node_modules/.bin:$PATH

COPY . .

RUN npm run build

FROM nginx:1.25.4-alpine3.18

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/

EXPOSE 3000

ENTRYPOINT ["nginx","-g","daemon off;"]
