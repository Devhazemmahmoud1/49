var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/paymentstatus', function(req, res) {
  //res.render('index', { title: 'Express' });
  console.log(req.io)
  return res.send('Everything is working good thanks kofta')
});

router.get('/socket', function (req, res) {
  return res.send('hello socket')
})

module.exports = router;
