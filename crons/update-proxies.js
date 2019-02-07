'use strict';

const proxy = require('../helpers/proxy');

(async function run() {
  try {
    await proxy.getProxies();
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();