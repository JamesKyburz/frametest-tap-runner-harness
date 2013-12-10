var http = require('http');

var server = http.createServer();

server.on('request', function(q, r) {
  console.log(q.url);
});

server.listen(1338);
