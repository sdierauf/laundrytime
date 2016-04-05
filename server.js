// API api

// CONST

var mailgun_APIKEY = 'key-131c8b8ac0a1d756922a45c49cc3f3ef';
var mailgun_DOMAIN = 'sandbox23ba88b23b6e4abd8d6e14b0d52572bc.mailgun.org';

// Libraries
var Hapi = require('hapi');
var Joi = require('joi');
var low = require('lowdb');
var storage = require('lowdb/file-sync');
var good = require('good');
var _ = require('lodash');
var Mailgun = require('mailgun-js')({apiKey: mailgun_APIKEY, domain: mailgun_DOMAIN});

var createServer = function(port, dbName) {
  // Server props
  var db = low(dbName, { storage });

  // Set up api
  var api = new Hapi.Server();

  api.db = db;
  api.connection({
    host: 'localhost',
    port: port
  })

  var activeJobs = {};

  //
  // Functions
  //

  var validateMachine = function(machine) {
    var machineTypes = ['washer', 'dryer'];
    return machineTypes.indexOf(machine.type) !== -1;
  }

  // Curried email builder so intermediate state can be saved;
  var buildEmail = function(src) { 
    return function(dest) {
      return function(subj) {
        return function (msg) {
          return {
            from: src,
            to: dest,
            subject: subj,
            text: msg
          }
        }
      }
    }
  }

  var finishJob = function(job) {
    var finishedMail = job.mailForUserPartial("Job finished")("Your LaundryTime job has finished.");
    Mailgun.messages().send(finishedMail, function(error, body) {
      if (error) {
        api.log('error', error);
      }
      api.log('info', body);
    });
    db(job.machineName).activeJob = {};
  }

  var scheduleJob = function(job) {
    activeJobs[job.machineName] = {}
    if (job.minues == 0) {
      finishJob(job);
      return;
    }
    db('machines').find({name: job.machineName}).activeJob = job;
    var timeout = setTimeout(1000 * 60, function() {
      job.minutes = job.minutes - 1;
      scheduleJob(job);
    });
    activeJobs[job.machineName] = timeout;
  }


  var startJob = function(job) {
    api.log('info', 'starting job' + job);
    // start schedule
    // send mail
    var mailForUserPartial = buildEmail("noreply <laundrytime-admin@" + mailgun_DOMAIN)(job.user)
    job.mailPartial = mailForUserPartial;
    scheduleJob(job)
    var startedMail = job.mailPartial("Job started")("Your LaundryTime job has been started.");
    Mailgun.messages().send(startedMail, function(error, body) {
      if (error) {
        api.log('error', error);
      }
      api.log('info', body);
    })
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
    newMachine.activeJob = {};
    if (!validateMachine(newMachine)) {
      api.log('error', 'Not a valid machine!');
      api.log('error', newMachine);
      return res('Not a valid machine').code(404);
    }
    db('machines').push(newMachine);
    return res(newMachine).code(200);
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
      minutes: req.payload.minutes,
      machineName: req.params.machineName
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

  var deleteCurrentActiveJob = {};
  deleteCurrentActiveJob.method = 'POST';
  deleteCurrentActiveJob.path = '/machines/{machineName}/active';
  deleteCurrentActiveJob.config = {};
  deleteCurrentActiveJob.handler = function(req, res) {
    var machine = db('machines').find({name: req.params.machineName});
    if (req.payload.user == machine.activeJob.user && req.payload.pin == machine.activeJob.pin) {
      clearTimeout(activeJobs[req.params.machineName].timeoutObj);
      activeJobs[req.params.machineName] = {};
      var formerActiveJob = machine.activeJob;
      machine.activeJob = {};
      return res(activeJob).code(200);
    }
  }
  deleteCurrentActiveJob.config.validate = {
    payload: {
      pin: Joi.number().integer().min(0).max(999),
      user: Joi.string().email()
    }
  }

  var getCurrentActiveJob = {};
  getCurrentActiveJob.method = 'GET';
  getCurrentActiveJob.path = '/machines/{machineName}/active';
  getCurrentActiveJob.handler = function(req, res) {
    return res(db('machines').find({name: req.params.machineName}).activeJob).code(200);
  }

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
  api.route(deleteCurrentActiveJob);
  api.route(getCurrentActiveJob);


  // api.get('/machines/:id', function(req, res, next) {
  //  console.log('GET: machine %s', req.params.id)
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

  return api;
}


// api.start(function(err) {
//   if (err) {
//     throw err;
//   }
//   console.log('server running at:', api.info.uri);
// });

module.exports = {
  createServer: createServer
}