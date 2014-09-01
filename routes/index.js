var express = require('express');
var marked  = require('marked');
var session = require('express-session');
var os      = require('os');
var sha256  = require('sha256').x2;
var path    = require('path');
var fs      = require('fs');

var router  = express.Router();

/*
 * VARIABLE CONVENTION
 * globale variable begin as `__var`
 * locals variable begin as `_var`
 * argunent variable `var`
 */

var __titre     = 'Kaluchua';
var __indexSize = 8;
var __encoding  = 'utf-8';
var __dir       = 'data';
var __data_dir  = path.join(process.cwd(), __dir);

/*********************************************/
/* BOOK ROUTING *****************************/


/* ARTICLE *************************************/

router.get('/book/article', function(req, res) {
  res.redirect('/book/index/0');
});


router.get('/book/article/:idx', function(req, res) {
  req.session.last_url          = req.session.new_url;
  req.session.new_url           = '/book/article';

  var _index = Number(req.params.idx);
  var _file  = path.join(__data_dir, req.session.files[_index]);
  var _data  = JSON.parse(fs.readFileSync(_file));

  _data.title = __titre;
  if (_data.format == "markdown") {
    _data.content = marked(_data.content, function (e, d) { return d; });
  }

  res.render('book/article', _data);
});




/* INDEX *************************************/

function mult0(nb, module) {
  if (module >= nb) {
    return 1;
  } else {
    var i=1;
    while (nb > module) {
      i=i+1; nb=nb-module;
    }
    return i;
  }
}

// good thing to write test case
function mult(nb, module) {
  // to ensure terminaison
  return mult0(Math.abs(nb), Math.abs(module));
}

function array_select(start, len, array){
  return array.slice(start*len,(++start)*len);
}

router.get('/book/index', function(req, res) {
  res.redirect('/book/index/0');
});


router.get('/book/index/:page', function(req, res) {
  req.session.last_url          = req.session.new_url;
  req.session.new_url           = '/book/index';

  var _offset = (req.params.page) ? Number(req.params.page) : 0;
//  var _files = req.session.files.sort().reverse();
  var _files = req.session.files;
  var _size = _files.length;

/*
  if (req.session.last_url === '/book/preview') {
    req.session.files.sort().reverse();
  }
*/

  var _counter = 0;
  var _lines = array_select(_offset, __indexSize, _files).map(function(file) {
      var _file = path.join(__data_dir, file);
      var content = JSON.parse(fs.readFileSync(_file, __encoding));
      return {
        titre: content.titre,
        tags: content.tags,
        ref: '/book/article/' + ((_counter++) + __indexSize * _offset),
      };
    });

  var _pager = {
    hasPrevious: (_offset > 0) ? ('/book/index/' + (_offset - 1)) : false,
    hasNext: (((_offset + 1) * __indexSize) < _size) ? ('/book/index/' + ( _offset + 1)) : false,
    whichOne: _offset + 1,
    pagesNumber: mult(_size, __indexSize),
  };

  res.render('book/index', {title: __titre, lines: _lines, pager: _pager});
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
      title: __titre,
      content: article_content,
      titre:   article_titre,
      messages: req.flash('info'),
      tags:    article_tags,
    });
  } else {
    req.session.last_url = '/book/new';
    res.render('book/new', {title: __titre});
  }
});


router.post('/book/new', function (req, res){
  format = (req.body.fmt_markdown) ? "markdown" : "raw";

  req.session.data = {
    title:    __titre,
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
        req.session.files.sort().reverse();

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

  res.render('layout', { title: __titre });
});

/*********************************************/

module.exports = router;
