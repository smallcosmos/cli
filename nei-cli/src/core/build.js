const request = require('request-promise');
const rc = require('../util/rc');
const log = require('../util/log');
const fs = require('fs');
const shell = require('shelljs');
const Spooky = require('spooky');
// const path = require('path');


class Builder {
  constructor(options) {
    this.options = options;
    this.initPid();
    this.checkEnv();
    this.getSession();
    // this.getByPage();
  }

  run() {
    const { tag } = this.options;
    if (tag) {
      //
    }
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

  async getByPage() {
    console.log(`${rc.pageUrl}?pid=${this.pid}`);
    const res = await request(`${rc.pageUrl}/?pid=${this.pid}`);
    console.log(res);
  }

  checkEnv() {
    const python = shell.which('python');
    if (!python) {
      log.red('python is needed. [https://www.python.org/downloads/]');
    }
  }

  getSession() {
    const spooky = new Spooky({
      child: {
        transport: 'http',
      },
      casper: {
        logLevel: 'debug',
        verbose: true,
      },
    }, (err) => {
      console.log(333);
      if (err) {
        console.log(222);
        const e = new Error('Failed to initialize SpookyJS');
        e.details = err;
        throw e;
      }
      spooky.start(`${rc.root}?pid=${this.pid}`, () => {
        console.log(this.getTitle());
      });
      spooky.then(() => {
        console.log('then');
      });
      spooky.run();
    });
    spooky.on('error', (e, stack) => {
      console.error(e);
      if (stack) {
        console.log(stack);
      }
    });
  }

  async isLogin() {
    const res = await request(`${rc.root}?pid=${this.pid}`);
    if (res.indexOf('login-bg') !== -1 && res.indexOf('openIdLoginBtn') !== -1) {
      return false;
    }
    return true;
  }
}

module.exports = Builder;
