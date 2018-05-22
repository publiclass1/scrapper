"use strict";
var webpage = require('webpage'),
  fs = require('fs');

var system = require('system');
var env = system.env;

var USER_AGENT = env.USER_AGENT;
var cookieJarFilePath = (env.COOKIE_DIR || fs.workingDirectory) + '/cookies.json';
phantom.cookiesEnabled = true;

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

function PhantomBrowser() {
  this.page = webpage.create();
  this.page.settings.userAgent = USER_AGENT;
  this.page.settings.javascriptEnabled = true;
  this.page.settings.loadImages = false;
  this.page.settings.resourceTimeout = 15000;

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


    callback();
  });
}

//read cookies before to start
Utils.readCookiesFromFile();
var url = env.url;
var setting = null;
var browser = new PhantomBrowser();
var html = null;

if (env.setting) {
  var _setting = null;
  try {
    _setting = atob(env.setting);
    setting = JSON.parse(_setting);
  } catch (e) {}

  // console.log(JSON.stringify(setting,null,2));
  // phantom.exit(0);
}

browser.queue = [
  function () {
    if (setting) {
      // console.log(setting);
      // phantom.exit(0);
      browser.page.open(url, setting);
    } else {
      browser.page.open(url);
    }
  },
  function () {
    // browser.page.render('page.png')
    html = browser.page.evaluate(function () {
      return document.querySelector('html').outerHTML
    })
  }
]
browser.executeQueue(function () {
  Utils.writeCookiesToFile();
  console.log(html);

  phantom.exit(0);
})