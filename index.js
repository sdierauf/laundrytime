var apiServer = require('./server.js');

var PROD_DB = 'prod.json';
var PORT = 8080;

apiServer.createServer(PORT, PROD_DB);
