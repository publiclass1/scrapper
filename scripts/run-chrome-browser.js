'use strict';
const url = require('url');
const path = require('path');
const ChromeBrowser = require('./chrome-browser');
const WEB_URL = process.env.URL;
const HEADLESS = !!process.env.HEAD;


const PROXY_SERVERS = [
  'us-wa.proxymesh.com:31280',
  'fr.proxymesh.com:31280'
];

function getDomain(host) {
  return host && host.split(':').shift();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getProxyServer() {
  const index = getRandomInt(0, PROXY_SERVERS.length - 1);
  const proxyServer = PROXY_SERVERS[index];
  const domainName = getDomain(proxyServer);

  return {
    proxyServer,
    domainName
  }
}

(async function () {
  const partsUrl = url.parse(WEB_URL);
  const tmp404 = `${partsUrl.protocol}//${partsUrl.host}/404-not-found`;
  // console.log('tmp404', tmp404)
  const { proxyServer, domainName } = getProxyServer();
  const proxy = `http://${proxyServer}`;
  const cookiePath = path.resolve(__dirname, '..', `${domainName}-cookies.json`);
  const args = [
    'proxy-server=' + proxy
  ];
  const browser = new ChromeBrowser(cookiePath, args, HEADLESS);

  try {
    // browser.setProxy(proxy); firefox
    await browser.build();
    await browser.loadCookies(tmp404);
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