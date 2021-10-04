FROM node:16

WORKDIR /app

COPY . .

RUN npm i --production

EXPOSE 8080
EXPOSE 50051

CMD [ "npm", "start" ]
