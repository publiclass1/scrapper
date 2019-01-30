'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const chromedriverPath = require('chromedriver').path;
const chrome = require('selenium-webdriver/chrome');
const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const log = () => process.env.DEBUG && console.log(...arguments);
const DEFAULT_COOKIE_PATH = path.resolve(__dirname, '..', 'cb-cookies.json');
class ChromeBrowser {

  constructor(cookiePath, args = [], fullbrowser = true) {
    this.cookiePath = cookiePath || DEFAULT_COOKIE_PATH;
    this.chromeArgs = args;
    this.options = new chrome.Options();
    this.isHeadless = !fullbrowser;

    this.options.setUserPreferences(
      { 'profile': { 'managed_default_content_settings': { 'images': 2 } } });

    // if headless lets set the arguments
    if (this.isHeadless) {
      const width = 1024;
      const height = 799;
      
      this.chromeArgs = _.uniq(_.concat(args, [
        'headless',
        `window-size=${width},${height}`,
        'no-sandbox', 'disable-dev-shm-usage', 'disable-web-security'
      ]));
    }

    log('this.chromeArgs', this.chromeArgs)
    this.chromeArgs.forEach(arg => this.options.addArguments(arg));
  }

  setProxy(proxy) {
    this.options.setProxy({
      httpProxy: proxy,
      proxyType: "manual"
    })
  }

  async build() {
    var service = new chrome.ServiceBuilder(chromedriverPath).build();
    chrome.setDefaultService(service);
    this.driver = await new Builder()
      .withCapabilities(Capabilities.chrome())
      .forBrowser('chrome')
      .setChromeOptions(this.options)
      .build();
  }

  async loadCookies(url, cookies = []) {
    try {
      await this.driver.get(url);

      let allCookies = cookies;
      if (fs.existsSync(this.cookiePath)) {
        log('Loading cookies', this.cookiePath);
        const fileData = fs.readFileSync(this.cookiePath, 'utf8');
        try {
          const cookies = JSON.parse(fileData);
          if (_.isArray(cookies)) {
            allCookies = allCookies.concat(cookies);
          }
          log('allCookies length', allCookies && allCookies.length);
        } catch (e) { console.error('Parsing cookies error', e); }
      }

      for (let i in allCookies) {
        const cookie = allCookies[i];
        log('cookie', cookie);
        await this.driver.manage().addCookie(cookie);
        log('setting cookie', cookie);
      }
      return true;
    } catch (e) {
      log('Error on setting cookies', e);
    }
    return false;
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getHTML() {
    const code = 'return document.documentElement.outerHTML;';
    return await this.driver.executeScript(code);
  }

  async getCookies() {
    return await this.driver.manage().getCookies();
  }

  async saveCookies() {
    const cookies = await this.getCookies();
    fs.writeFileSync(this.cookiePath, JSON.stringify(cookies), 'utf8');
  }

  async quit() {
    await this.saveCookies();
    await this.driver.close();
    await this.driver.quit();
  }

  async  open(url, waitUntilTitleIs) {
    await this.driver.get(url);

    if (waitUntilTitleIs) {
      await this.driver.wait(
        until.titleIs(waitUntilTitleIs)
      );
    }
  }

  async waitDomReady(timeout = 60) {
    await this.driver.wait(
      async () => {
        const status = await this.getDriver()
          .executeScript("return document.readyState");
        return status === 'complete';
      },
      timeout
    );
  }

  async sleep(seconds) {
    await this.driver.sleep(seconds * 1000);
  }

  getDriver() {
    return this.driver;
  }

  async getTab(index = 0) {
    const tabs = await this.driver.getAllWindowHandles();
    return _.nth(tabs, index);
  }

  async setActiveTab(index) {
    const tab = this.getTab(index);
    await this.driver.switchTo().window(tab);
  }

  async waitAnClick(selector, timeout = 60) {
    try {
      await this.waitUntilElementLocated(selector, timeout);
    } catch (e) {
      console.error('Element not found', selector);
      return;
    }
    try {
      await this.click(selector);
    } catch (e) {
      console.error('Element not clickable (not found)', selector);
    }
  }
  async waitUntilElementLocated(selector, timeout = 60) {
    await this.driver.wait(
      until.elementLocated(
        By.css(selector)
      ), timeout * 1000
    );
  }

  async waitUntilElementsLocated(selector, timeout = 60) {
    try {
      await this.driver.wait(
        until.elementsLocated(
          By.css(selector)
        ), timeout * 1000
      );
    } catch (e) {
      console.error(e);
      log('Elements not located');
    }
  }
  async refresh() {
    await this.driver.navigate().refresh();
  }

  async closeTab() {
    await this.driver.close();
  }

  async openNewTab(url) {
    await this.driver.executeScript(`window.open("${url}")`);
  }

  async waitUntilElementNotLocated(selector, timeout = 60) {
    await this.driver.wait(
      async () => {
        const el = await this.findElement(selector);
        return !el;
      }, timeout
    )
  }

  async  getValueOr(selector, defaultValue = '0') {
    const cleanSelector = _.isArray(selector) ? selector : [selector];
    for (let i in cleanSelector) {
      const select = cleanSelector[i];
      try {
        const val = await this.getElementAttr(select, 'value');
        return val || defaultValue;
      } catch (e) {
      }
    }
    return defaultValue;
  }

  async  getByXpathValueOr(selector, defaultValue = '0') {
    const cleanSelector = _.isArray(selector) ? selector : [selector];
    for (let i in cleanSelector) {
      const xpath = cleanSelector[i];
      try {
        const val = await this.getElementAttrByXpath(xpath, 'value');
        return val || defaultValue;
      } catch (e) {
      }
    }
    return defaultValue;
  }

  async getElementAttrByXpath(selector, attr, defaults = '') {
    const el = await this.driver.findElement(
      By.xpath(selector)
    );

    if (el) {
      return await el.getAttribute(attr);
    }
    return defaults;
  }


  async getElementAttr(selector, attr, defaults = '') {
    const el = await this.driver.findElement(
      By.css(selector)
    );

    if (el) {
      return await el.getAttribute(attr);
    }
    return defaults;
  }

  async findElement(selector) {
    try {
      return await this.driver.findElement(
        By.css(selector)
      );
    } catch (e) {
      console.error('Element not found', selector);
    }

    return null;
  }
  async findElements(selector) {
    try {
      return await this.driver.findElements(
        By.css(selector)
      );
    } catch (e) {
      console.error('Element not found', selector);
    }
    return [];
  }

  async inputElement(selector, value) {
    const el = await this.findElement(selector);
    if (!el) return console.error('Element not found for selector [' + selector + '] !');
    await el.sendKeys(value);
  }

  async inputClear(selector) {
    const el = await this.findElement(selector);
    if (!el) return console.error('Element not found for selector [' + selector + '] !');
    await el.clear();
  }

  async inputAndEnterElement(selector, value) {
    const el = await this.findElement(selector);
    if (!el) return console.error('Element not found for selector [' + selector + '] !');
    await el.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END), value, Key.ENTER);
  }

  async click(selector) {
    const el = await this.findElement(selector);
    if (el) {
      await el.click();
    }
    console.error('Element not found for click, selector [' + selector + '] !');
  }

  async getElementText(selector, defaults = '') {
    const el = await this.findElement(selector);
    if (el) {
      return await el.getText();
    }
    console.error('Element not found for selector [' + selector + '] !');
    return defaults;
  }

  async waitUntilTitleIs(title, timeout = 60) {
    await this.driver.wait(
      until.titleIs(title), timeout * 1000
    );
  }

  async waitUntilTitleContains(title, timeout = 60) {
    await this.driver.wait(
      until.titleContains(title), timeout * 1000
    );
  }
}

module.exports = ChromeBrowser;
