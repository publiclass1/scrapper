'use strict';

const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const btoa = require('btoa');
const FILE_DIR = path.resolve(__dirname, '..', 'proxies.json');
const PROXY_MESH_API = 'https://proxymesh.com/api/proxies/';
const USER = 'james@evergreensupplypr.com';
const PWD = '^et7ftyV)VPtEJ8U';
const basicAuth = btoa(`${USER}:${PWD}`);

async function getProxies() {
  try {
    const rs = await axios.get(PROXY_MESH_API, {
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    });
    const { data } = rs;
    await saveData(data);
  } catch (e) { }

}

async function readData() {
  if (fs.existsSync(FILE_DIR)) {
    const data = fs.readFileSync(FILE_DIR, 'utf8');
    try {
      const proxy =  JSON.parse(data);
      return proxy.proxies || [];
    } catch (e) { }
  }
  return [];
}

async function saveData(data) {
  // {"proxies": ["DOMAIN:PORT"]}
  fs.writeFileSync(FILE_DIR, JSON.stringify(data));
}

module.exports = {
  readData, saveData,getProxies
};