const http = require('http');

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Server is alive');
}

const server = http.createServer(requestListener);
// server.listen(8081);

module.exports = server;
