var express = require('express');
var marked  = require('marked');
// var filer   = require('./stack');
var session = require('express-session');
var os      = require('os');
var sha256  = require('sha256').x2;
var path    = require('path');
var fs      = require('fs');


var router  = express.Router();

var _titre = 'Kaluchua';

/*********************************************/
/* BOOK ROUTING *****************************/

/* INDEX *************************************/

var __indexSize = 8;

function array_select(start, len, array){
  return array.slice(start*len,(++start)*len);
}


router.get('/book/index', function(req, res) {
  req.session.last_url = req.session.new_url;
  req.session.new_url  = '/book/index';

  if (req.session.last_url === '/book/preview') {
    var _files = req.session.files.sort().reverse();
    var _lines = array_select(0, __indexSize, _files);

    _lines.forEach(function (x) { console.log(x);});
    res.render('book/index', {title: _titre, lines: _lines});
  } else {
    res.render('book/index', {title: _titre});
  }
});


/* NEW **************************************/

router.get('/book/new', function (req, res){
  req.session.last_url = req.session.new_url;
  req.session.new_url  = '/book/new';

  if (req.session.last_url == '/book/preview') {
    article_content = req.session.data.text_raw;
    article_titre   = req.session.data.titre;
    article_tags    = req.session.data.tags;
    res.render('book/new', {
      title: _titre,
      content: article_content,
      titre:   article_titre,
      messages: req.flash('info'),
      tags:    article_tags,
    });
  } else {
    req.session.last_url = '/book/new';
    res.render('book/new', {title: _titre});
  }
});


router.post('/book/new', function (req, res){
  format = (req.body.fmt_markdown) ? "markdown" : "raw";

  req.session.data = {
    title:    _titre,
    titre:    req.body.ntitre,
    tags:     req.body.ntags,
    format:   format,
    text_raw: req.body.text,
  };

  res.redirect('/book/preview');
});

/* PREVIEW ***********************************/

router.get('/book/preview', function (req, res){
  req.session.last_url = req.session.new_url;
  req.session.new_url  = '/book/preview';

  data = req.session.data;
  if (data.format == "markdown") {
    data.text_fmt = marked(data.text_raw, function (e, d) { return d; });
  }
  res.render('book/preview', data);
});


function exist(name, array){
  var _hash = sha256(name);
  if (array.filter(function (x) { return _hash === x.substring(11);}).length === 0) {
    return false;
  }
  return true;
}


function saveFile(data, name) {
  var _data_dir = 'data';
  var fileName = path.join(path.join(process.cwd(), _data_dir), name);
  var fd  = fs.openSync(fileName, 'w');
  var len = fs.writeSync(fd, JSON.stringify(data));
  var t   = fs.closeSync(fd);
  return len;
}

router.post('/book/preview', function (req, res){
  if (req.body.save) {
    console.log(req.session.files[0]);
    if (exist(req.session.data.titre, req.session.files)) {
      // Already exist tell to user via template to change title
      req.flash('info', 'Title already in use');
      res.redirect('/book/new');
    } else {
        var __time = Number(os.uptime() * 1000 * 1000).toFixed().toString();
        var __sha256 = __time + sha256(req.session.data.titre);
        var file_data = {
        titre:   req.session.data.titre,
        tags:    req.session.data.tags,
        content: req.session.data.text_raw,
        format:  req.session.data.format,
        time:  __time,
        };

        var len = saveFile(file_data, __sha256);
        req.session.files.push(__sha256);

        res.redirect('/book/index');
    }
  } else {
    res.redirect('/book/new');
  }
});

/*********************************************/
/*********************************************/


/*********************************************/
/* *** HOME ROUTING *** */

router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/index', function(req, res) {
  req.session.last_url = req.session.new_url;
  req.session.new_url = '/index';

  res.render('layout', { title: _titre });
});

/*********************************************/

module.exports = router;
