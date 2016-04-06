// Test get machiens
var fs = require('fs');

try {
    fs.accessSync('testdb.json', fs.F_OK);
    fs.unlinkSync('testdb.json');
    // Do something
} catch (e) {
    // It isn't accessible
    console.log(e);
}
var server = require('../server.js').createServer(8000, 'testdb.json');

var addTestMachine = function(name) {
  var newMachine = {};
  newMachine.name = name;
  newMachine.type = 'washer';
  newMachine.queue = [];
  newMachine.operational = true;
  newMachine.problemMessage = "";
  newMachine.activeJob = {};  
  server.db('machines').push(newMachine);
}

describe('ALL THE TESTS LOL', function() {

  it('should add a machine', function(done) {
    var options = {
      method: 'POST',
      url: '/machines',
      payload: {
        name: 'test1',
        type: 'washer'
      }
    }

    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      var p = JSON.parse(response.payload);
      expect(p.name).toBe(options.payload.name);
      expect(p.type).toBe(options.payload.type);
      done();
    })
  });



  it('should get all machines', function(done) {
    var name = 'testMachine';
    var name2 = 'anotherMachine';
    addTestMachine(name);
    addTestMachine(name2);

    var options = {
      method: 'GET',
      url: '/machines',
    }

    server.inject(options, function(res) {
      expect(res.statusCode).toBe(200);
      var p = JSON.parse(res.payload);
      // check p has test and anotherMachine
      done();
    });
  });


  it('should get one machine', function(done) {
    var name = 'sweetTestMachine';
    addTestMachine(name);

    var options = {
      method: 'GET',
      url: '/machines/'+name
    };

    server.inject(options, function(res) {
      expect(res.statusCode).toBe(200);
      var p = JSON.parse(res.payload);
      expect(p.name).toBe(name);
      done();
    });

  });

  it('should add a job the queue then th queue should have the person', function(done) {
    addTestMachine('queueTest');
    var addOptions = {
      method: 'POST',
      url: '/machines/queueTest/queue',
      payload: {
        user: 'test@mail.com',
        pin: 1234,
        minutes: 50
      }
    };

    server.inject(addOptions, function(res) {
      expect(res.statusCode).toBe(200);
      var p = JSON.parse(res.payload);
      expect(p.name).toBe('queueTest');
      var getQueue = {
        method: 'GET',
        url: '/machines/queueTest/queue'
      };
      server.inject(getQueue, function(newRes) {
        expect(newRes.statusCode).toBe(200);
        var q = JSON.parse(newRes.payload);
        console.log(q);
        expect(q.queue[0].user).toBe('test@mail.com');
        expect(q.queue[0].pin).toBe(1234);
        done();
      })
    })
  });

  it('should delete a job from the queue', function(done) {
    addTestMachine('anotherQueue');
    var addOptions = {
      method: 'POST',
      url: '/machines/anotherQueue/queue',
      payload: {
        user: 'test@mail.com',
        pin: 1235,
        minutes: 50
      }
    };
    server.inject(addOptions, function(res) {
      var deleteOptions = addOptions;
      deleteOptions.url = '/machines/anotherQueue/queue/delete';
      deleteOptions.payload = {
        user: addOptions.payload.user,
        pin: addOptions.payload.pin
      }
      server.inject(deleteOptions, function(r) {
        expect(r.statusCode).toBe(200);
        console.log(JSON.parse(r.payload));
        done();
      })
    })

  })

  it('should add a job to the active queue', function(done) {
    addTestMachine('activeQueue');
    var addOptions = {
      method: 'POST',
      url: '/machines/activeQueue/queue',
      payload: {
        user: 'test@mail.com',
        pin: 1235,
        minutes: 50
      }
    };
    server.inject(addOptions, function(r) {
      var runJobOptions = {
        method: 'POST',
        url: '/machines/activeQueue/queue/start',
        payload: {
          command: 'next',
          pin: 1235,
          minutes: 0
        }
      };
      server.inject(runJobOptions, function(res) {
        expect(res.statusCode).toBe(200);
        done();
      })
    })

  });

});