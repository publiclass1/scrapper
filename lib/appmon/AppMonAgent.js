'use strict';
const axios = require('axios').default;
const APP_MONITORING_API = 'http://api.monitoring.evergreen.tools';

const FATAL = 'FATAL';
const URGENT = 'URGENT';
const ERROR = 'ERROR';
const LOG = 'LOG';

class AppMonAgent {

  constructor(workerId) {
    if (!workerId) throw new Error('Worker id is required!');
    this.workerId = workerId;
  }

  async ping() {
    try {
      await this._get(`${APP_MONITORING_API}/workers/ping`, {
        params: {workerId: this.workerId},
      });
    } catch (e) { throw e; }
  }

  async log(payload) {
    return this._log(
      LOG,
      payload
    );
  }

  async error(payload) {
    return this._log(
      ERROR,
      payload
    );
  }
  async urgent(payload) {
    return this._log(
      URGENT,
      payload
    );
  }

  async fatal(payload) {
    return this._log(
      FATAL,
      payload
    );
  }

  async _log(type, payload) {
    if (!type) {
      throw new Error('Log type is required!');
    }

    if (!payload) {
      throw new Error('Payload object is required!');
    }

    try {
      await this._post(`${APP_MONITORING_API}/${this.workerId}/logs`, {
        type,
        payload,
      });
    } catch (e) {
      throw e;
    }
  }

  _get(url, config) {
    return axios.get(url, config);
  }

  _post(url, data, config) {
    return axios.post(url, data, config);
  }
}

AppMonAgent.init = function(workerId) {
  return new AppMonAgent(workerId);
};

module.exports = AppMonAgent;
