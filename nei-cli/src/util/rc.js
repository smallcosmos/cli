const rc = require('rc');

const config = rc('nei', {
  root: 'https://nei.netease.com/',
  pageUrl: 'https://nei.netease.com/api/pages/',
  projectUrl: 'https://nei.netease.com/project/',
  interfacesUrl: 'https://nei.netease.com/api/interfaces/',
  projectMap: {
    // name => pid
    'haitao-warelogis-system': 12332,
  },
});

module.exports = config;
