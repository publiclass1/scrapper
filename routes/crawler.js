const express = require('express');
const router = express.Router();
const _ = require('lodash')
const scraper = require('../helpers/phantom-scraper')
const extranContents = require('../helpers/extract-contents')

/* GET crawler listing. */
router.post('/', function (req, res, next) {
  const schema = req.body.schema || {}
  const url = req.body.url
  const pagination = req.body.pagination || {
    nextLink: {
      selector: ''
    }
  }

  if (!url) {
    return next(new Error('Invalid url'))
  }

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
    })
});

module.exports = router;
