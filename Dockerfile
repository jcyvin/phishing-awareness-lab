FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY server.js ./
COPY index.html ./
COPY index.js ./
COPY style.css ./
COPY submit.html ./
COPY submit.js ./
COPY success.html ./
COPY success.js ./
COPY database ./database

EXPOSE 3000

CMD ["node", "server.js"]