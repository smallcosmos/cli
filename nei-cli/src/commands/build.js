const Builder = require('../core/build');
const log = require('../util/log');

exports.command = 'build [options]';

exports.desc = 'Auto build static json from NEI';

exports.builder = {
  t: {
    alias: 'tag',
    demand: false,
    describe: 'filtered by tag',
    type: 'string',
  },
  i: {
    alias: 'id',
    demand: false,
    describe: 'filtered by id',
    type: 'string',
  },
  V: {
    alias: 'Verbose',
    demand: false,
    describe: 'to see all of the things Casper has to say',
    type: 'boolean',
  },
};

exports.handler = async (argv) => {
  try {
    const builder = new Builder(argv);
    builder.run();
  } catch (error) {
    log.red(error);
  }
};
