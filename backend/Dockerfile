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


CMD ["node", "dist/index.js"]   
