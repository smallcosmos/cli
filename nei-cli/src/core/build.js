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
    const { Verbose } = this.options;
    const spooky = new Spooky({
      child: {
        transport: 'http',
      },
      casper: {
        logLevel: 'debug',
        verbose: true,
        viewportSize: {
          width: 1440, height: 768,
        },
        onPageInitialized() {
          console.log('pageInitialized');
        },
      },
    }, (err) => {
      if (err) {
        const e = new Error('Failed to initialize SpookyJS');
        e.details = err;
        throw e;
      }
      spooky.start(`${rc.root}?pid=${this.pid}`, () => {
        console.log('location: login');
        // this.wait(5 * 1000, function(){
        //   console.log('I\'ve waited for 5 seconds.');
        // });
      });
      spooky.then(function () {
        // this.emit('login', this.evaluate(function(){
        //   return {
        //     url: location.href,
        //     html: document.querySelector('html').outerHTML
        //   }
        // }));

        this.evaluate(function () {
          this.document.querySelectorAll('#openIdLoginBtn')[0].click();
          this.document.querySelectorAll('#openIdLoginBtn')[0].click();
          this.alert(this.location.href);
        });

        // this.click('#openIdLoginBtn');

        // this.thenClick('#openIdLoginBtn', function(){
        //   console.log(1111)
        // });
      });
      spooky.then(function () {
        // CasperJS
        this.wait(100 * 1000, () => {
          console.log('I\'ve waited for 100 seconds.');
        });
        this.waitFor(function check() {
          return this.evaluate(() => document.querySelectorAll('#id_corpid').length > 0);
        });
      });
      spooky.then(function () {
        // CasperJS
        console.log(`clicked ok, new location is ${this.getCurrentUrl()}`);
      });

      spooky.thenEvaluate((item) => {
        // PhantomJS
        console.log(111, item);
      }, 'test');
      spooky.run();
    });
    spooky.on('login', () => {
      // const cheerio = require('cheerio');
      // const $ = cheerio.load(e.html);
      // console.log($('#openIdLoginBtn')[0]);
    });
    spooky.on('error', (e, stack) => {
      console.error(e);
      if (stack) {
        console.log(stack);
      }
      process.exit(1);
    });

    if (Verbose) {
      spooky.on('console', (line) => {
        console.log(line);
      });
    }
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
