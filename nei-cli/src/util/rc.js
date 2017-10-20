const rc = require('rc');

const config = rc('nei', {
  pageUrl: 'https://nei.netease.com/page/',
  projectUrl: 'https://nei.netease.com/project/',
  interfaces: 'https://nei.netease.com/api/interfaces/',
  projectMap: {
    // name => pid
    'haitao-warelogis-system': 12332,
  },
});

module.exports = config;
