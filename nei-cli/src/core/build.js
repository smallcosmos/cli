const request = require('request-promise');
const Events = require('events');
const rc = require('../util/rc');
const log = require('../util/log');
const session = require('../util/session');
const fs = require('fs');
const shell = require('shelljs');
const urlParser = require('url');
const validUrl = require('valid-url');

class Builder extends Events {
  constructor(options) {
    super();
    this.options = options;
    this.checkEnv();
    this.initPid();
  }

  async run() {
    const sessionValid = session.check();
    if (sessionValid) {
      log.green('session valid.');
      log.yellow('run nei-cli...');
      this._run();
    } else {
      this.on('sessionCompleted', () => {
        session.write(this.options.sessions, true);
        this._run();
      });
      log.yellow('get session...');
      session.init(this);
    }
  }

  _run() {
    const { uri } = this.options;
    if (uri) {
      this.parseUrl(uri);
    }
    // this.getAllInterface();
  }

  parseUrl(uri) {
    if (!validUrl.isUri(uri)) {
      log.error('url invalid.');
      process.exit(1);
    }
    const options = urlParser.parse(uri);
    console.log(options);
  }

  initPid() {
    if (!fs.existsSync('.neirc')) {
      log.red('can not find .neirc');
      process.exit(1);
    }
    const { stdout } = shell.pwd();
    const nameArr = stdout.trim().split('/');
    const name = nameArr.find(value => value in rc.projectMap);
    const pid = rc.projectMap[name] || rc.pid;
    if (!pid) {
      log.red('can not find pid in .neirc');
      process.exit(1);
    }
    this.pid = pid;
  }

  async getAllPage() {
    if (!this.pid) {
      return false;
    }
    const options = {
      uri: rc.pageUrl,
      qs: {
        pid: this.pid,
      },
      headers: {
        Cookie: session.get(),
      },
      json: true,
    };
    const res = await request(options);
    return res;
  }

  async getOnePage(id) {
    if (!id) {
      return false;
    }
    const options = {
      uri: `${rc.pageUrl}${id}`,
      headers: {
        Cookie: session.get(),
      },
      json: true,
    };
    const res = await request(options);
    return res;
  }

  async getOneInterface(id) {
    if (!id) {
      return false;
    }
    const options = {
      uri: `${rc.interfacesUrl}${id}`,
      headers: {
        Cookie: session.get(),
      },
      json: true,
    };
    const res = await request(options);
    return res;
  }

  async getAllInterface() {
    if (!this.pid) {
      return false;
    }
    const options = {
      uri: rc.interfacesUrl,
      qs: {
        pid: this.pid,
      },
      headers: {
        Cookie: session.get(),
      },
      json: true,
    };
    const res = await request(options);
    console.log(res);
    return res;
  }

  checkEnv() {
    const python = shell.which('python');
    if (!python) {
      log.red('python is needed. [https://www.python.org/downloads/]');
      process.exit(1);
    }
    if (!shell.exec('phantomjs --version')) {
      log.red('phantomjs is needed. use \'npm install phantomjs -g to install\'');
      process.exit(1);
    }
    if (!shell.exec('casperjs --version')) {
      log.red('casperjs is needed. use \'npm install casperjs -g to install\'');
      process.exit(1);
    }
  }
}

module.exports = Builder;
