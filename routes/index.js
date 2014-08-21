var express = require('express');
var marked  = require('marked');
var filer   = require('./stack');
var session = require('express-session');
var router  = express.Router();
/*
marked.setOptions({
  highlight: function(code) {
    return light.highlight(code).value;
  }
});
*/

/* GET home page. */
router.get('/', function(req, res) {
  res.render('layout', { title: 'Kaluchua' });
});

router.get('/raw', function(req, res) {
//  res.render('index', { title: 'Express' });
    re.redirect('/');
});

/*
router.post('/', function(req, res) {

  console.log("Save btn: "    + req.body.save);
  console.log("Sube btn: "    + req.body.push);
  console.log("Mardown Box: " + req.body.m1);
  console.log("Text Box: "    + req.body.m2);
  console.log("Title: "       + req.body.titre);

  var filename = req.body.titre;
  var data = req.body.text;

  if (req.body.save) {
    var len = filer(filename, data);
    console.log(len);
  }

  if (req.body.m1) {
    data = marked(data, function (e, d) { return d; });
  }

  res.render('index', { title: 'Kaluchua', mark: data});

});

*/
router.post('/', function(req, res) {

  /*
  console.log("Save btn: "    + req.body.save);
  console.log("Sube btn: "    + req.body.push);
  console.log("Mardown Box: " + req.body.m1);
  console.log("Text Box: "    + req.body.m2);
  console.log("Title: "       + req.body.titre);
*/
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

module.exports = router;

/*
  marked(req.body.text, function (err, content) {
    if (err) throw err;
    console.log('Formatted: ' + content);
    res.render('index', { title: 'Express', mark: content});
    if (req.body.sav_btn) {

    }
    res.redirect('/');
  });
*/
