FROM node:18-alpine as BUILD_IMAGE

WORKDIR /app/backend

COPY package.json .
COPY tsconfig.json .   

RUN npm install

COPY . .

RUN npm run build    

FROM node:18-alpine as PRODUCTION_IMAGE

WORKDIR /app/backend

COPY --from=BUILD_IMAGE /app/backend/dist /app/backend/dist
COPY package.json .

RUN npm install --only=production

EXPOSE 5000

ENV PORT=5000
ENV MONGO_DB_URI="mongodb+srv://systemR2:8DRKGWP16bRvNRzM@cluster0.gta3o43.mongodb.net/chat-app-db"
ENV JWT_SECRET="FZJHE0Z4cF/rvqp4IAGWTp8y1AQTGSGUxetBksUBpAI="
ENV NODE_ENV=production   

CMD ["node", "dist/index.js"]   
