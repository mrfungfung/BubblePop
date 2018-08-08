const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

function buildConfig(configDirs) {
    
    let devConfig = Object.assign({}, require('./common')(configDirs));
    console.log("Building for development");

    devConfig.plugins.push(
        new CopyWebpackPlugin([
            {from: path.join(configDirs.THIRD_PARTY_DIR,"facebook_mock"), to: configDirs.BUILD_DIR},
            {from: path.join(configDirs.APP_DIR,"fbapp-config.json"), to: configDirs.BUILD_DIR}
        ])
    );
    return devConfig;
}

module.exports = buildConfig;
