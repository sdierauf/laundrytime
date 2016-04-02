// API api

// CONST
var api_NAME = 'laundrytime';
var PORT = 8000;


// Libraries
var Hapi = require('hapi');
var Joi = require('joi');
var low = require('lowdb');
var storage = require('lowdb/file-sync');
var good = require('good');
var _ = require('lodash');


var db = low('db.json', { storage })

// Set up api
var api = new Hapi.Server();

api.connection({
  host: 'localhost',
  port: PORT
})


//
// Functions
//

var validateMachine = function(machine) {
  var machineTypes = ['washer', 'dryer'];
  return machineTypes.indexOf(machine.type) !== -1;
}

var startJob = function(job) {
  console.log("Starting job: ", job);
}


//
// Route Definitions
//

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

var getAllMachines = {};
getAllMachines.method = 'GET';
getAllMachines.path = '/machines';
getAllMachines.handler = function(req, res) {
  return res(db('machines'));
}

var postMachine = {};
postMachine.method = 'POST';
postMachine.path = '/machines';
postMachine.config = {};
postMachine.handler = function(req, res) {
  var newMachine = {};
  newMachine.name = req.payload.name;
  newMachine.type = req.payload.type;
  newMachine.queue = [];
  newMachine.operational = true;
  newMachine.problemMessage = "";
  if (!validateMachine(newMachine)) {
    api.log('error', 'Not a valid machine!');
    api.log('error', newMachine);
    return res('Not a valid machine').code(404);
  }
  db('machines').push(newMachine);
  return res({
    message: 'added machine'
  }).code(200);
}
postMachine.config.validate = {
  payload: {
    name: Joi.string(),
    type: Joi.string()
  }
}

// var reportMachineProblem = {};
// reportMachineProblem.method = 'POST';
// reportMachineProblem.path 

var getQueue = {};
getQueue.method = 'GET';
getQueue.path = '/machines/{name}/queue';
getQueue.handler = function(req, res) {
  return res({
    queue: db('machines').find({name: req.params.name}).queue
  });
}

var addUserToQueue = {};
addUserToQueue.method = 'POST';
addUserToQueue.path = '/machines/{machineName}/queue';
addUserToQueue.config = {};
addUserToQueue.handler = function(req, res) {
  var machine = db('machines').find({name: req.params.machineName});
  // console.log(machine);
  var user = req.payload.user;
  if (!machine) {
    // return error
    return res({message: 'no machine with that name'}).code(404)
  }
  api.log('info', 'Machine: ' + machine)
  for (var i = 0; i < machine.queue.length; i++) {
    if (machine.queue[i].user == user) {
      // return already in queue
      return res({
        message: 'already in the queue'
      }).code(404);
    }
  }
  var queueItem = {
    user: user,
    pin: req.payload.pin,
    minutes: req.payload.minutes
  }
  machine.queue.push(queueItem);
  return res(machine).code(200);
  
}

addUserToQueue.config.validate = {
  payload: {
    user: Joi.string().email(),
    minutes: Joi.number().integer().min(1).max(90),
    pin: Joi.number().integer().min(0).max(9999)
  }
}

var dequeueAndRunJob = {};
dequeueAndRunJob.method = 'POST';
dequeueAndRunJob.path = '/machines/{machineName}/queue/start';
dequeueAndRunJob.config = {};
dequeueAndRunJob.handler = function(req, res) {
  if (req.payload.command != "next") {
    return res({message: "incorrect command"}).code(404);
  }
  // get queue
  var machine = db('machines').find({name: req.params.machineName});
  if (!machine) {
    return res({message: "machine not found"}).code(404)
  }
  var queue = machine.queue;
  // check if empty
  if (queue.length == 0) {
    return res({message: "queue empty"}).code(404);
  }
  // if not, start a timer, pop queue, and return 200,
  var job = queue[0];
  if (req.payload.pin != job.pin) {
    return res({message: "PIN was incorrect"}).code(404);
  }
  if (req.payload.minutes > 0) {
    job.minutes = req.payload.minutes;
  }
  queue.shift();
  startJob(job);
  return res(job).code(200);
}

dequeueAndRunJob.config.validate = {
  payload: {
    command: Joi.string(),
    pin: Joi.number().integer().min(0).max(9999),
    minutes: Joi.number().integer().min(0).max(200)
  }
}

// delete from queue
var deleteFromQueue = {};
deleteFromQueue.method = 'POST';
deleteFromQueue.path = '/machines/{machineName}/queue/delete';
deleteFromQueue.config = {};
deleteFromQueue.handler = function(req, res) {
  var machine = db('machines').find({name: req.params.machineName});
  if (!machine) {
    return res({message: 'machine not found'}).code(404);
  }
  var queue = machine.queue;
  if (queue.length == 0) {
    return res({message: 'queue empty'}).code(404);
  }
  var itemIndex = _.findIndex(queue, ['user', req.payload.user]);
  if (itemIndex < 0) {
    return res({message: 'user not found'}).code(404);
  }
  var found = queue[itemIndex];
  if (found.pin != req.payload.pin) {
    return res({message: 'incorrect pin'}).code(404);
  }
  var deleted = queue.slice(itemIndex, 1);
  return res(deleted).code(200);
};
deleteFromQueue.config.validate = {
  payload: {
    user: Joi.string().email(),
    pin: Joi.number().integer().min(0).max(9999)
  }
}



// report problem
var reportProblem = {};
reportProblem.method = 'POST';
reportProblem.path = '/machines/{machineName}/report';
reportProblem.config = {};
reportProblem.handler = function(req, res) {
  var machine = db('machines').find({name: req.params.machineName});
  if (!machine) {
    return res({message: 'machine not found'}).code(404);
  }
  machine.operational = false;
  machine.problemMessage = req.payload.message;
  return res(machine).code(200);
}
reportProblem.config.validate = {
  payload: {
    message: Joi.string()
  }
}

// to get the current problem, just get the machine, then res.problemMessage;


// email integration

// phone integration?


api.route(hello);
api.route(getMachine);
api.route(getAllMachines);
api.route(postMachine);
api.route(getQueue);
api.route(addUserToQueue);
api.route(dequeueAndRunJob);
api.route(deleteFromQueue);
api.route(reportProblem);


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
