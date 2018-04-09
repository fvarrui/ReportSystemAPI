const dev = require('./development');
const pro = require('./production');

const env = process.env.NODE_ENV !== 'production' ? dev : pro;

module.exports = env;