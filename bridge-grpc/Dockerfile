FROM node:16

WORKDIR /app

COPY . .

RUN npm i --production

# HTTP/2
EXPOSE 8080
# Health_check HTTP/1.1
EXPOSE 8081

HEALTHCHECK --interval=10s --timeout=10s --start-period=5s \
  CMD curl --fail http://127.0.0.1:8081 || exit 1


CMD [ "npm", "start" ]
