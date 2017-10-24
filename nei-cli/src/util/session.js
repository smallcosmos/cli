const Spooky = require('spooky');
const request = require('request-promise');
const log = require('../util/log');
const rc = require('../util/rc');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../session.json');

const format = (content) => {
  const s = new Set();
  content.map(x => s.add(x));
  return [...s];
};

const check = () => {
  log.yellow('check session...');
  if (!fs.existsSync(dir)) {
    return false;
  }
  let sessions = fs.readFileSync(dir, { encoding: 'utf8' });
  if (sessions.trim() === '') {
    return false;
  }
  sessions = sessions.split('\n');
  let inValid = true;
  // find inValid session
  inValid = sessions.some((item) => {
    const result = /expires=(([\w\W]+)GMT);/.exec(item);
    if (result != null) {
      try {
        const expires = new Date(result[1]);
        const current = new Date();
        const start = new Date('Thu, 02-Jan-1970 00:00:00 GMT');
        if (expires < current && expires > start) {
          return true;
        }
        return false;
      } catch (e) {
        throw (e);
      }
    }
    return false;
  });
  return !inValid;
};

const get = () => {
  if (!fs.existsSync(dir)) {
    return false;
  }
  let sessions = fs.readFileSync(dir, { encoding: 'utf8' });
  if (sessions.trim() === '') {
    return false;
  }
  sessions = sessions.split('\n');
  const _s = [];
  sessions.forEach((item) => {
    const result = /([\S]+=[\S]*;)/.exec(item);
    if (result != null) {
      _s.push(result[1]);
    }
  });
  return _s.join(' ');
};

const write = (content, force) => {
  const valid = check();
  if (valid && !force) {
    log.yellow('session 未过期');
    return false;
  }
  fs.writeFile(dir, format(content).join('\n'), () => {});
};

/*eslint-disable*/
const init = (parent) => {
  const { Verbose } = parent.options;
  const self = parent;
  const spooky = new Spooky({
    child: {
      // transport: 'http',
    },
    casper: {
      logLevel: 'debug',
      verbose: true,
      viewportSize: {
        width: 1440, height: 768,
      },
      clientScripts:  [
      ],
      pageSettings: {
        loadImages: false,
        localToRemoteUrlAccessEnabled: true,
        allowMedia: false,
        plainTextAllContent: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
      },
      onPageInitialized: function(){
        console.log('pageInitialized');
      },
      onAlert: function(casper, res){
        // CasperJS
      },
      onResourceReceived: function(casper, res) {
        this.emit('responseReceive', this.evaluate(function(res){
          return {
            res: res
          }
        }, {res: res.headers}));
      },
      onResourceRequested: function(casper, res){
        console.log('resource requested', res);
      },
      onTimeout: function(timeout){
        console.log('timeout', timeout);
      },
      onResourceTimeout: function(){
        console.log('resource timeout');
      }
    }
  }, async (err) => {
    if (err) {
      const e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      console.log('error: ', e.details);
      throw e;
    }
    const res = await request(`${rc.root}api/loginwithopenid?url=/project/?pid=${parent.pid}`, {json: true});
    if (!/^2/.test(res.code)) {
      log.red(res.msg || 'api/loginwithopenid unknow error', res);
      process.exit(1);
    }
    spooky.start(`${res.result.url}`, function start_cb() {
      this.wait(1000, function wait_cb(){
        console.log('I\'ve waited for 1 seconds.', this.getCurrentUrl());       
      });
      // this.clear();
      // this.clearCache();
      // this.clearMemoryCache();
    });

    spooky.then(function(){
      this.wait(1000, function(){
        this.capture('/Users/linxingjian/Downloads/account.png')
        this.fill('#corp form', {
          "corpid": "hzlinxingjian",
          "corppw": "Lin65517293"
        }, true);
      });
    });
    
    spooky.then(function () {
      this.wait(2000, function(){
        this.emit('success', this.evaluate(function () {
            return {}
        }));
        this.exit(200);
      });
    });

    spooky.run();
  });

  spooky.on('error', function(e, stack){
    console.log('error: ', e, stack);
  });
  
  spooky.on('responseReceive', function(e){
    var res = e.res;
    var headers = {};
    res.forEach(function(item){
      headers[item.name] = item.value;
    });
    if(headers['Set-Cookie']){
      console.log(222222, headers['Set-Cookie']);
      this.setSession(headers['Set-Cookie']);
    }
  });

  spooky.setSession = function(session){
    this.sessions = this.sessions || [];
    this.sessions.push(session);
  }

  spooky.on('success', function(){
    self.options.sessions = this.sessions;
    self.emit('sessionCompleted')
  });

  if (Verbose) {
    spooky.on('console', function(line){
      console.log(line);
    });
  }
}
/* eslint-enable */

module.exports = {
  check, get, write, init,
};
