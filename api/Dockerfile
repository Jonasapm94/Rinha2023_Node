FROM node:lts-alpine3.18

WORKDIR /usr/app
# COPY *.js ./
# COPY *.json ./
COPY package*.json .
RUN npm install
COPY . .


EXPOSE 3000
CMD [ "node", "main.js" ]