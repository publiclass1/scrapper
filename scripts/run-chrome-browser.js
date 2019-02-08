'use strict';
const url = require('url');
// const path = require('path');
const ChromeBrowser = require('./chrome-browser');
const WEB_URL = process.env.URL;
const HEADLESS = !!process.env.HEAD;
const PROXY = process.env.PROXY;

const log = (...args)=> process.env.DEBUG && console.log(...args);

(async function () {
  
  const partsUrl = url.parse(WEB_URL);
  log('partsUrl',partsUrl);
  const tmp404 = `${partsUrl.protocol}//${partsUrl.host}/404-not-found`;
  log('tmp404', tmp404)
  
  // const cookiePath = null;// path.resolve(__dirname, '..', `${domainName}-cookies.json`);
  const args = [
    'proxy-server=' + PROXY
  ];

  log('Proxy arguments', args);
  
  const browser = new ChromeBrowser(cookiePath, args, HEADLESS);

  try {
    // browser.setProxy(proxy); firefox
    await browser.build();
    // await browser.loadCookies(tmp404);
    await browser.open(WEB_URL);
    await browser.waitDomReady();
    const html = await browser.getHTML();
    console.log(html);
  } catch (e) {
    console.log(e);
  }
  await browser.quit();

  process.exit(0);
})();