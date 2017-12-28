var express = require('express');
var router = express.Router();
const fs = require('fs')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    name: 'amz crawler'
  })
});

router.get('/health-check', function (req, res) {
  fs.exists(__dirname + '/../amz.err', function (err) {
    if (err) {
      res.send(500, 'Something went wrong!')
    } else {
      res.json({
        health: 'ok'
      })
    }
  })
});

module.exports = router;
