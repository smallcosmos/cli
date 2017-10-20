// const rc = require('../util/rc');
const log = require('../util/log');
const fs = require('fs');

class Builder {
  constructor(options) {
    this.options = options;
    this.initPid();
  }

  run() {
    const { tag } = this.options;
    if (tag) {
      //
    }
  }

  initPid() {
    if (!fs.existsSync('.neirc')) {
      log.red('can not find nei.rc');
      process.exit(1);
    }
    const dirname = __dirname;
    console.log(111, dirname);
  }
}

module.exports = Builder;
