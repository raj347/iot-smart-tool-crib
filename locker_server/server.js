var express = require('express');
var gpio = require('rpi-gpio');
var SmartLockerM2X = require('./smart-locker-m2x.js');
var app = express();

var accessPerDay = 0;

let lockers = {
  1: {doorStatus: 'closed', lockStatus: 'locked'},
  2: {doorStatus: 'closed', lockStatus: 'locked'}
}

let gpioPins = {
  'lock' : {
    1: 7,
    2: 29
  },
  'sense' : {
    1: 16,
    2: 18
  },
  'buzzer' : 38,
  'led' : {
    1: {'R': 31, 'G': 33, 'B': 35},
    2: {'R': 15, 'G': 11, 'B': 13}
  }
}

//GPIO Outputs
gpio.setup(gpioPins.lock[1], gpio.DIR_OUT, lockInit.bind(this, 1));
gpio.setup(gpioPins.lock[2], gpio.DIR_OUT, lockInit.bind(this, 2));
gpio.setup(gpioPins.buzzer, gpio.DIR_OUT, buzzerInit);
gpio.setup(gpioPins.led[1]['R'], gpio.DIR_OUT, led1Init.bind(this, 1, 'R'));
gpio.setup(gpioPins.led[1]['G'], gpio.DIR_OUT, led1Init.bind(this, 1, 'G'));
gpio.setup(gpioPins.led[1]['B'], gpio.DIR_OUT, led1Init.bind(this, 1, 'B'));
gpio.setup(gpioPins.led[2]['R'], gpio.DIR_OUT, led2Init.bind(this, 2, 'R'));
gpio.setup(gpioPins.led[2]['G'], gpio.DIR_OUT, led2Init.bind(this, 2, 'G'));
gpio.setup(gpioPins.led[2]['B'], gpio.DIR_OUT, led2Init.bind(this, 2, 'B'));

//GPIO Inputs
gpio.setup(gpioPins.sense[1], gpio.DIR_IN, senseInit.bind(this, 1));
gpio.setup(gpioPins.sense[2], gpio.DIR_IN, senseInit.bind(this, 2));

//Default States
setTimeout(defaultState, 1000);

function lockInit(id) {
  setLock(id, 'lock');
}

function buzzerInit() {
  setBuzzer('off');
}

function led1Init(id, color) {
  setLED(id, color, 'off');
}

function led2Init(id, color) {
  setLED(id, color, 'on');
}

function senseInit(id) {
  lockers[id].doorStatus = getDoor(id, function(){});
}

function setBuzzer(value) {
  var buzzer = {'on': false, 'off': true};
  gpio.write(gpioPins.buzzer, buzzer[value], function(err) {
      if (err) throw err;
      console.log('Written to Buzzer');
  });
}

function setLock(id, value) {
  var lock = {'lock': false, 'unlock': true};
  gpio.write(gpioPins.lock[id], lock[value], function(err) {
      if (err) throw err;
      console.log('Written to Lock');
  });
}

function setLED(id, color, value) {
  var led = {'on': false, 'off': true};
  gpio.write(gpioPins.led[id][color], led[value], function(err) {
      if (err) throw err;
      console.log('Written to Lock');
  });
}

function getDoor(id, callback) {
  var door = {true: 'open', false: 'closed'};
  gpio.read(gpioPins.sense[id], function(err, value) {
    console.log('The door is ' + door[value]);
    callback(err, door[value]);
  });
}

function checkClosedBuzzerOff(id) {
  getDoor(id, function(err, value) {
    if (value == 'open') {
      setTimeout(checkClosedBuzzerOff.bind(this, id), 100);
    }
    else {
      setBuzzer('off');
    }
  });
}

function lockIfOpen(id) {
  // setBuzzer('off');
  getDoor(id, function(err, value) {
    if (value == 'open') {
      setBuzzer('on');
      setLock(id, 'locked');
      var ledGreen = {1: 'off', 2: 'on'};
      var ledRed = {1: 'on', 2: 'off'};
      setLED(id, 'G', ledGreen[id]);
      setLED(id, 'R', ledRed[id]);
      setTimeout(checkClosedBuzzerOff.bind(this, id), 100);
    }
    else {
      setTimeout(lockIfOpen.bind(this, id), 100);
    }
  });
}

function defaultState() {
  var ledRed = {1: 'on', 2: 'off'};
  setLock(1, 'lock');
  setLock(2, 'lock');
  setLED(1, 'R', ledRed[1]);
  setLED(2, 'R', ledRed[2]);
  lockers[1].lockStatus = 'locked';
  lockers[2].lockStatus = 'locked';
  lockers[1].doorStatus = 'closed'
  lockers[2].doorStatus = 'closed'
  console.log("Default State Done: "+JSON.stringify(lockers));
}

app.get('/', function (req, res) {
  res.send('OK');
});

app.get('/unlock', function (req, res) {
  var ledGreen = {1: 'on', 2: 'off'};
  var ledRed = {1: 'off', 2: 'on'};
  var id = req.param('id');
  console.warn("Locker id: unlocked", id);
  setLock(id, 'unlock');
  setLED(id, 'G', ledGreen[id]);
  setLED(id, 'R', ledRed[id]);
  setTimeout(lockIfOpen.bind(this, id), 5000);
  accessPerDay += 1;
  SmartLockerM2X.updateDoorCount(id, accessPerDay);
  res.send(id);
});

app.get('/lock', function (req, res) {
  var ledGreen = {1: 'off', 2: 'on'};
  var ledRed = {1: 'on', 2: 'off'};
  var id = req.param('id');
  console.warn("Locker id: locked", id);
  setLock(id, 'lock');
  setLED(id, 'G', ledGreen[id]);
  setLED(id, 'R', ledRed[id]);
  res.send(id);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000');
});
