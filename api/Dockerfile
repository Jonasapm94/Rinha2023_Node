FROM node:lts-alpine3.19

COPY *.js .
COPY *.json .

RUN npm install

EXPOSE 3000
CMD [ "node", "main.js" ]