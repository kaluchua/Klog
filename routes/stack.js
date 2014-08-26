var path = require('path');
var os   = require('os');
var fs   = require('fs');
var sha256  = require('sha256').x2;

var _data_dir = 'data';

function fileName(titre, time){
  var _hash = time + sha256(titre);
  return path.join(path.join(process.cwd(), _data_dir), _hash);
}

module.exports = function (data) {
  var fd  = fs.openSync(fileName(data.titre, data.time), 'w');
  var len = fs.writeSync(fd, JSON.stringify(data));
  var t   = fs.closeSync(fd);
  return len;
};
