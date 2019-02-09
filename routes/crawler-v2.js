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
const proxyHelper = require('../helpers/proxy');

async function sleep(seconds) {
  return new Promise(r => {
    setTimeout(() => r(), seconds * 1000);
  })
}
function getDomain(host) {
  return host && host.split(':').shift();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getProxyServer() {
  const PROXY_SERVERS = await proxyHelper.readData();
  const index = getRandomInt(0, PROXY_SERVERS.length - 1);
  const proxyServer = PROXY_SERVERS[index];
  const domainName = getDomain(proxyServer);

  return {
    proxyServer,
    domainName
  }
}


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

  const { proxyServer } = await getProxyServer();
  const proxy = `http://${proxyServer}`;
  const nodeLocation = await asyncExec('which node');
  const cmdParts = [
    `PROXY="${proxy}"`,
    `URL="${url}"`,
    nodeLocation,
    script
  ];
  console.log('HEADLESS', HEADLESS);
  if (HEADLESS) {
    cmdParts.unshift(`HEAD=${HEADLESS}`);
  }
  const cmd = cmdParts.join(' ');
  const retryCount = 5;
  let retry = 0;
  let html;
  let $;
  console.log('cmd', cmd);

  do {
    html = await asyncExec(cmd, {
      maxBuffer: 1024 * 1024 * 50
    });
    $ = cheerio.load(html);
    const title = $('title').text().trim();
    console.log('Title', title);
    if (
      !title ||
      title === 'Sorry! Something went wrong!' ||
      title === 'Robot Check') {
      retry += 1;
      await sleep(1);
    } else {
      break;
    }
  } while (retry < retryCount);

  try {
    const title = $('title').text().trim();
    if (
      title === 'Sorry! Something went wrong!' ||
      title === 'Robot Check') {
      await appMon.fatal({
        type: 'james-online-scraper',
        data: {
          proxy,
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
