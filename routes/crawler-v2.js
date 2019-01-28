const express = require('express');
const router = express.Router();
const _ = require('lodash');
const cheerio = require('cheerio');
const _url = require('url');
const asyncMiddleware = require('../middlewares/asyncMiddleware');
const extractContents = require('../helpers/extract-contents');
const ChromeBrowser = require('../scripts/chrome-browser');
const HEADLESS = !!(process.env.HEAD);
/* GET crawler listing. */
router.post('/', asyncMiddleware(async function (req, res, next) {
  const schema = req.body.schema || {}
  const url = req.body.url;
  const setting = req.body.setting;

  if (!url) {
    return next(new Error('Invalid url'))
  }

  const partsUrl = _url.parse(url);
  const tmp404 = `${partsUrl.protocol}//${partsUrl.host}/404-not-found`;
  // console.log('tmp404', tmp404)
  const proxy = `http://rmenguito:Proxymesh1!@us-wa.proxymesh.com:31280`;
  const args = [];
  if(!headless){
    args.push(proxy);
  }
  const browser = new ChromeBrowser(null,args, HEADLESS);
  try {
    // browser.setProxy(proxy); firefox
    await browser.build();

    await browser.loadCookies(tmp404);
    await browser.open(url);
    await browser.waitDomReady();


    const html = await browser.getHTML();
    const $ = cheerio.load(html);
    const data = extractContents($, schema);
    // console.log('data', html);
    // console.log('data', data);
    res.json({
      url: url,
      results: data,
      html
    });
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  } finally {
    await browser.quit();
  }

}));

module.exports = router;
