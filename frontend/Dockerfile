FROM node:16.3.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
