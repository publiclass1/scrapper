const path = require('path');
const exec = require('child_process').exec;
const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const asyncMiddleware = require('../middlewares/asyncMiddleware');
const extractContents = require('../helpers/extract-contents');
const HEADLESS = !!(process.env.HEAD);
const script = path.resolve(__dirname + '/../scripts/run-chrome-browser.js');
const appMon = require('../lib/appmon/AppMonAgent').init('5c5b9ecf464b3e4c778cba6f');


function asyncExec(cmd, args = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, args, function (e, a) {
      if (e) return reject(e);
      if (a) {
        a = a.trim();
        a = a.replace(/(\r\n|\n|\r)/gm, "");
      }
      resolve(a);
    });
  });
}

/* GET crawler listing. */
router.post('/', asyncMiddleware(async function (req, res, next) {
  const schema = req.body.schema || {}
  const url = req.body.url;

  if (!url) {
    return next(new Error('Invalid url'))
  }
  const nodeLocation = await asyncExec('which node');
  const cmdParts = [
    `URL="${url}"`,
    nodeLocation,
    script
  ];
  console.log('HEADLESS', HEADLESS);
  if (HEADLESS) {
    cmdParts.unshift(`HEAD=${HEADLESS}`);
  }
  const cmd = cmdParts.join(' ');
  console.log('cmd', cmd);
  try {
    const html = await asyncExec(cmd, {
      maxBuffer: 1024 * 1024 * 50
    });
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    if (
      title === 'Sorry! Something went wrong!' ||
      title === 'Robot Check') {
        await appMon.fatal({
          type: 'james-online-scraper',
          data: {
            title,
            html
          }
        });
        return res.status(500).send('Amazon blocked. :(');
    }
    const data = extractContents($, schema);
    res.json({
      url: url,
      results: data
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
}));

module.exports = router;
