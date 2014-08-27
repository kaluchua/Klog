var express      = require('express');
var path         = require('path');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var routes       = require('./routes/index');
var session      = require('express-session');
var flash        = require('connect-flash');
var path         = require('path');
var fs           = require('fs');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// configure middlewire
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(session({
  secret: '1234567890QWERTY',
  saveUninitialized: true,
  resave: true}));

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  if (req.session.loaded) {
    next();
  } else {
    var _dir           = path.join(process.cwd(),'data');
    files              = fs.readdirSync(_dir);
    req.session.files  = files.sort().reverse();
//    console.log(_dir);
//    files.forEach(function (x) { console.log(x);});
    req.session.loaded = true;
    next();
  }
});


app.use(function (req, res, next) {
  if (req.session.last_url) {
    next();
  } else {
   req.session.last_url = '/';
   req.session.new_url  = '/';
   res.redirect('/index');
  }
});


// routes loading
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
