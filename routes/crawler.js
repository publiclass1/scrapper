const express = require('express');
const router = express.Router();
const _ = require('lodash')
const scraper = require('../helpers/phantom-scraper')
const extractContents = require('../helpers/extract-contents')
const fs = require('fs');
const path = require('path');
const userAgentHelper = require('../helpers/user-agent');

/* GET crawler listing. */
router.post('/', function (req, res, next) {
  const schema = req.body.schema || {}
  const url = req.body.url;
  const setting= req.body.setting;


  if (!url) {
    return next(new Error('Invalid url'))
  }

  const errFilename = path.resolve(__dirname + '/../amz.err');
  const cookieFilename = path.resolve(__dirname + '/../cookies.json');
  let hasError = false;

  fs.exists(errFilename, function (exist) {
    console.log('Is amz error exist', exist);
    if (exist) {
      // try to make a new set agent
      // remove cookies.json
      console.log('Removing \n', errFilename,
        '\n', cookieFilename)

      if (fs.existsSync(path.resolve(errFilename)))
        fs.unlinkSync(path.resolve(errFilename));

      // console.log('fs.existsSync(cookieFilename)', fs.existsSync(cookieFilename))
      if (fs.existsSync(path.resolve(cookieFilename)))
        fs.unlinkSync(path.resolve(cookieFilename));
      // res.status(500)
      //   .send('Something went wrong!')
      hasError = true;
    }

    // return res.status(500).send('ff');
    userAgentHelper(hasError, (err, agent) => {
      if (err) {
        return res.status(500)
          .send('Something went wrong!')
      }
      if (!agent) {
        return res.status(501)
          .send('Agent is required');
      }
      console.log('New UserAgent', agent);

      scraper(url, agent, setting)
        .then($ => {
          return extractContents($, schema)
        }).then(data => {
          res.json({
            url: url,
            results: data
          })
        }).catch(e => {
          next(e)
        });
    });

  })

});

module.exports = router;
