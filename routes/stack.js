var path = require('path');
var os = require('os');
var fs   = require('fs');
var bCrypt = require('bcrypt-nodejs');

var bullet = {
  state: true,
  value: 0,
  info: ''
};

var createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var close_fd = function(fd) {
  try {
    fs.closeSync(fd);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = function (name, data) {
/*  var filecode  = createHash(titlebCrypt.genSaltSync(10); */
  var filetime  = Number(os.uptime() * 1000 * 1000).toFixed().toString();
  var filetitle = name + '_' + filetime;
  var filedata  = data;
  var filemode  = 'w';
  var filename  = path.join(path.join(process.cwd(), 'data'), filetitle);

  // Using fs.exists is supposed to expose to race condition
  fs.existsSync(filename, function (exists) { if (exists) throw err;});

  var fd  = fs.openSync(filename, filemode);
  var len = fs.writeSync(fd, filedata);
  var t   = fs.closeSync(fd);
  return len;
 };

