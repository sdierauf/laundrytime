// API api

// CONST
var api_NAME = 'laundrytime';
var PORT = 8080;


// Libraries
var restify = require('restify');
var Hapi = require('hapi');
var Joi = require('joi');
var low = require('lowdb');
var storage = require('lowdb/file-async');
var good = require('good');


var db = low('db.json', { storage })

// Set up api
var api = new Hapi.Server();

api.connection({
  host: 'localhost',
  port: 8000
})


var validateMachine = function(machine) {
  var machineTypes = ['washer', 'dryer'];
  return machineTypes.indexOf(machine.type) !== -1;
}

// Routes
var hello = {};
hello.method = 'GET';
hello.path = '/hello'
hello.handler = function(req, res) {
  api.log('error', 'Error: this isnt a real path');
  return res('hello world');
}

var getMachine = {};
getMachine.method = 'GET';
getMachine.path = '/machines/{name}';
getMachine.handler = function(req, res) {
  var machineName = req.params.name;
  var machine = db('machines').find({name: machineName});
  if (!machine) {
    api.log('error', 'Machine ' + machineName + ' not found.');
    return res('No machine found').code(404);
  }
  return res(machine);
}

var postMachine = {};
postMachine.method = 'POST';
postMachine.path = '/machines';
postMachine.config = {};
postMachine.handler = function(req, res) {
  var newMachine = {};
  newMachine.name = req.payload.name;
  newMachine.type = req.payload.type;
  if (!validateMachine(newMachine)) {
    api.log('error', 'Not a valid machine!');
    api.log('error', newMachine);
    return res('Not a valid machine').code(404);
  }
  db('machines').push(newMachine).then(function() {
    api.log('info', 'added machine', newMachine.name);
  })
  return res('added machine').code(200);
}
postMachine.config.validate = {
  payload: {
    name: Joi.string(),
    type: Joi.string()
  }
}


api.route(hello);
api.route(getMachine);
api.route(postMachine);


// api.get('/machines/:id', function(req, res, next) {
// 	console.log('GET: machine %s', req.params.id)
//   var machine = db('machines').find({id: req.params.id})
//   res.send(machine);
//   return next();
// });

// api.post('/machines/:id', function(req, res, next) {
//   console.log('POST: new machine %s', req.params.id);
//   return db('machines').push({id: req.params.id}).then(function() {
//     console.log('added machine %s', req.params.id);
//     res.send(200);
//     return next();
//   })
// })


// Init

api.register({
  register: good,
  options: {
    reporters: [{
      reporter: require('good-console'),
      events: {
        response: '*',
        log: '*'
      }
    }]
  }
}, function(err) {

  if (err) {
    throw err; // something bad happened loading the plugin
  }

  api.start((err) => {

    if (err) {
     throw err;
   }
   api.log('info', 'Server running at: ' + api.info.uri);
 });
});

// api.start(function(err) {
//   if (err) {
//     throw err;
//   }
//   console.log('server running at:', api.info.uri);
// });
