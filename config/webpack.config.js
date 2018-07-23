var path = require('path');

var BUILD_DIR = path.resolve(__dirname, '../dist');
var APP_DIR = path.resolve(__dirname, './src');
var THIRD_PARTY_DIR = path.resolve(__dirname, '../3rdparty');

const configDirs = {
  BUILD_DIR: BUILD_DIR,
  APP_DIR: APP_DIR,
  THIRD_PARTY_DIR: THIRD_PARTY_DIR
}

function buildConfig() {
    console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'development') {
        return require('./webpack.dev.config.js')(configDirs);
    } else if (process.env.NODE_ENV === 'production') {
        return require('./webpack.prod.config.js')(configDirs);
    } else {
        console.log("Wrong webpack build parameter. Possible choices: `dev` or `prod`.")
    }
}

module.exports = buildConfig;
