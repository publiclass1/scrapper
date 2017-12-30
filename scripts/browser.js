"use strict";
var webpage = require('webpage'),
  fs = require('fs');

var system = require('system');
var env = system.env;

var cookieJarFilePath = (env.COOKIE_DIR || fs.workingDirectory) + '/cookies.json';
var Utils = {

  readCookiesFromFile: function () {
    var cookieJar = [];
    if (fs.isFile(cookieJarFilePath)) {
      cookieJar = JSON.parse(fs.read(cookieJarFilePath));
    } else {
      this.writeCookiesToFile()
    }
    for (var j in cookieJar) {
      phantom.addCookie({
        'name': cookieJar[j].name,
        'value': cookieJar[j].value,
        'domain': cookieJar[j].domain,
        'path': cookieJar[j].path,
        'httponly': cookieJar[j].httponly,
        'secure': cookieJar[j].secure,
        'expires': cookieJar[j].expires
      });
    }

  },

  writeCookiesToFile: function () {
    var cookieJar = [];
    for (var j in phantom.cookies) {
      cookieJar.push({
        name: phantom.cookies[j].name,
        value: phantom.cookies[j].value,
        domain: phantom.cookies[j].domain,
        path: phantom.cookies[j].path,
        httponly: phantom.cookies[j].httponly,
        secure: phantom.cookies[j].secure,
        expires: phantom.cookies[j].expires
      });
    }

    fs.write(cookieJarFilePath, JSON.stringify(cookieJar), 'w');
  },
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getUserAgent() {
  var agents = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0',
    'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20130401 Firefox/31.0',
    'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0',
    'Mozilla/5.0 (X11; Linux) KHTML/4.9.1 (like Gecko) Konqueror/4.9',
    'Mozilla/5.0 (X11; Linux 3.5.4-1-ARCH i686; es) KHTML/4.9.1 (like Gecko) Konqueror/4.9',
    'Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16',
    'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
    'Mozilla/5.0 (Windows NT 6.0; rv:2.0) Gecko/20100101 Firefox/4.0 Opera 12.14',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/59.0.3071.109 Chrome/59.0.3071.109 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5'
  ]

  return agents[randomIntFromInterval(0, agents.length - 1)]
}

function PhantomBrowser() {
  this.page = webpage.create();
  this.page.settings.userAgent = getUserAgent()
  this.page.settings.javascriptEnabled = true;
  this.page.settings.loadImages = false;
  this.loadInProgress = false;
  this.queue = [];
  this.forceWait = false;

  var self = this;

  this.page.onLoadStarted = function () {
    self.loadInProgress = true;
  }

  this.page.onLoadFinished = function () {
    self.loadInProgress = false;
  };
}

PhantomBrowser.prototype.load = function (task, next) {
  task();
  var self = this;

  var checkAgain = function () {
    setTimeout(function () {
      if (!self.loadInProgress && !self.forceWait) {
        next();
      } else {
        checkAgain();
      }
    }, 500);
  }
  checkAgain();
};

PhantomBrowser.prototype.executeQueue = function (callback) {
  var self = this;
  var queue = this.queue;
  var checkBack = function (done) {
    var scheduleTask = queue.shift();
    if (!scheduleTask) {
      done();
      return;
    }

    //page all implemented on the queue
    self.load(scheduleTask, function () {
      setTimeout(function () {
        checkBack(done);
      }, 1000);
    });
  };

  checkBack(function () {
    Utils.writeCookiesToFile();

    callback();
  });
}

//read cookies before to start
Utils.readCookiesFromFile();
var url = env.url
var browser = new PhantomBrowser();
var html = null
browser.queue = [
  function () {
    browser.page.open(url)
  },
  function () {
    html = browser.page.evaluate(function () {
      return document.querySelector('html').outerHTML
    })
  }
]
browser.executeQueue(function () {
  console.log(html)
  phantom.exit(0)
})