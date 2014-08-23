var express = require('express');
var marked  = require('marked');
var filer   = require('./stack');
var session = require('express-session');
var router  = express.Router();


var _titre = 'Kaluchua';

/************************/
/* *** BOOK ROUTING *** */
router.get('/book/index', function(req, res) {
  res.render('book/index', {title: _titre});
});

/*********************************************/

router.get('/book/new', function (req, res){
  res.render('book/new', {title: _titre});
});

router.post('/book/new', function (req, res){
/*
  console.log(req.body.ntitre);
  console.log(req.body.ntags);
  console.log(req.body.text);
  console.log(req.body.fmt_markdown);
*/
  format = (req.body.fmt_markdown) ? "markdown" : "raw";
  console.log(format);

  req.session.data = {
    title: _titre,
    titre: req.body.ntitre,
    tags:  req.body.ntags,
    format: format,
    text:  req.body.text,
  };

  res.redirect('/book/preview');
});

/*********************************************/

router.get('/book/preview', function (req, res){
  data = req.session.data;
  console.log(data.tags);
  if (data.format == "markdown") {
    data.text = marked(data.text, function (e, d) { return d; });
  }
  console.log(data.text);
  res.render('book/preview', data);
});

router.post('/book/preview', function (req, res){
  console.log(req.body.save);
  if (req.body.save) {
    res.redirect('/book/index');
  } else {
    res.redirect('/book/new');
  }
});

/*********************************************/

/************************/
/************************/



/************************/
/* *** HOME ROUTING *** */

router.get('/', function(req, res) {
  res.redirect('/index');
});


router.get('/index', function(req, res) {
  res.render('layout', { title: _titre });
});

module.exports = router;

/*
router.get('/raw', function(req, res) {
    res.redirect('/');
});

router.post('/', function(req, res) {

  console.log("Save btn: "    + req.body.save);
  console.log("Sube btn: "    + req.body.push);
  console.log("Mardown Box: " + req.body.m1);
  console.log("Text Box: "    + req.body.m2);
  console.log("Title: "       + req.body.titre);
  var filename = req.body.titre;
  var data     = req.body.text;

  if (req.body.save) {
    var len = filer(filename, data);
    console.log(len);
  }

  if (req.body.m1) {
    data = marked(data, function (e, d) { return d; });
  }

  req.session.data = {
    title: 'Kaluchua',
    mark: data,
  };

  res.redirect('/view');
});


router.get('/view', function(req, res) {
  data = req.session.data;
  console.log(JSON.stringify(data));
  res.render('article', data);
});




  marked(req.body.text, function (err, content) {
    if (err) throw err;
    console.log('Formatted: ' + content);
    res.render('index', { title: 'Express', mark: content});
    if (req.body.sav_btn) {

    }
    res.redirect('/');
  });
*/
