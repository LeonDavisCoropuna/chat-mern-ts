# # specify base image from dockerhub
# FROM node:14-alpine3.10

# LABEL version="1.0"
# LABEL description="Development image for the Library MERN API"

# # workdir is where our code shall live in the container
# # all commands executed relative to this directory
# WORKDIR /app


# COPY package.json .
# COPY tsconfig.json .  

# # Install dependencies and clear npm cache
# RUN npm install

# COPY . .
# RUN npm build

# # use EXPOSE command to have our port mapped by the docker daemon
# EXPOSE 5000

# # default dev command


# ENV PORT=5000
# ENV MONGO_DB_URI="mongodb+srv://systemR2:8DRKGWP16bRvNRzM@cluster0.gta3o43.mongodb.net/chat-app-db"
# ENV JWT_SECRET="FZJHE0Z4cF/rvqp4IAGWTp8y1AQTGSGUxetBksUBpAI="
# ENV NODE_ENV=production  

# CMD [ "npm", "run", "start" ]


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
