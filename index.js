// API app

// CONST
var APP_NAME = 'laundrytime';
var PORT = 8080;


// Libraries
var restify = require('restify');
var low = require('lowdb');
var storage = require('lowdb/file-async');

var db = low('db.json', { storage })

// Set up app
var app = restify.createServer({
	name: APP_NAME,
	version: '0.0.69'
});
app.use(restify.acceptParser(app.acceptable));
app.use(restify.queryParser());
app.use(restify.bodyParser());

// Set up db
var test = db.object.machines;
if (test) {
	console.log(test);
} else {
	db('machines').push({id: 1}).then(function(){
		console.log('added test');
	})
}

// Routes
app.get('/machines/:id', function(req, res, next) {
	console.log('GET: machine %s', req.params.id)
  var machine = db('machines').find({id: req.params.id})
  res.send(machine);
  return next();
});

app.post('/machines/:id', function(req, res, next) {
  console.log('POST: new machine %s', req.params.id);
  return db('machines').push({id: req.params.id}).then(function() {
    console.log('added machine %s', req.params.id);
    res.send(200);
    return next();
  })
})


// Init
app.listen(PORT, function() {
	console.log('%s listening at %s', app.name, app.url);
})
