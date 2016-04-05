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
  var options = {
    method: 'POST',
    url: '/machines',
    payload: {
      name: name,
      type: 'washer'
    }
  }

  server.inject(options, function(res) {});
}

describe('machinezz', function() {

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
      console.log(p);
      var machines = res.payload.machines;
      done();
    })
  })



});