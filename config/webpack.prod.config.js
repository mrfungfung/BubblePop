const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

function buildConfig(configDirs) {
    let prodConfig = Object.assign({}, require('./common')(configDirs));
    console.log("Building for production");
    
    // prodConfig.optimization = {};
    prodConfig.optimization.minimizer = [
        new UglifyJsPlugin()
    ];
    if (process.env.WEB === 'true') {
        prodConfig.externals = {
            "gl-matrix" : "{vec2, vec3}",
            "pixi.js": "PIXI"
        };
    }

    return prodConfig;
}

module.exports = buildConfig;
