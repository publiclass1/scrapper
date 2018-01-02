const express = require('express');
const router = express.Router();
const _ = require('lodash')
const scraper = require('../helpers/phantom-scraper')
const extranContents = require('../helpers/extract-contents')
const fs = require('fs');

/* GET crawler listing. */
router.post('/', function (req, res, next) {
  const schema = req.body.schema || {}
  const url = req.body.url

  if (!url) {
    return next(new Error('Invalid url'))
  }

  fs.exists(__dirname + '/../amz.err', function (err) {
    if (err) {
      res.status(500).send('Something went wrong!')
    } else {
      scraper(url)
        .then($ => {
          return extranContents($, schema)
        }).then(data => {
          res.json({
            url: url,
            results: data
          })
        }).catch(e => {
          next(e)
        });
    }
  })

});

module.exports = router;
