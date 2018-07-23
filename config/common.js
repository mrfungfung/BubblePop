const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin")

function buildConfig(configDirs) {
    return {  
    entry: {
        main: './src/main.ts',
    },
    output: {
        filename: '[name].bundle.js',
        path: configDirs.BUILD_DIR
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
    module: {
        rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
        { test: /\.ts$/, loader: 'awesome-typescript-loader' },
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        {
            test: /\.(xml|png|svg|jpg|gif|wav)$/,
            loader: 'file-loader',
            options: {
                name: '[path][name].[ext]'
            }
        }
        ]
    },
    plugins: [
        new webpack.EnvironmentPlugin({
                                        // NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
                                        WEB: process.env.WEB,
                                        // DEBUG: false
                                        }),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.template.ejs',
            inject: true,
            cssPath: (process.env.WEB === 'true' ? '' : '<link href="./css/mock/mock.css" rel="stylesheet" type="text/css" />'),
            sdkPath: (process.env.NODE_ENV === 'development') ? 
                    (process.env.FBSDK === 'true' ? '<script src="https://connect.facebook.net/en_US/fbinstant.6.2.js"></script>' : '<script src="./fbinstant.6.0.mock.js"></script>') 
                    : 
                    (process.env.WEB === 'true' ? '' : '<script src="https://connect.facebook.net/en_US/fbinstant.6.2.js"></script>'),
            glmatrix: (process.env.NODE_ENV === 'development') ? '' :
                    (process.env.WEB === 'true' ? '<script src="https://unpkg.com/gl-matrix@2.6.1/dist/gl-matrix-min.js"></script>' : ""),
            pixijs: (process.env.NODE_ENV === 'development') ? '' :
                    (process.env.WEB === 'true' ? '<script src="https://unpkg.com/pixi.js@4.7.3/dist/pixi.min.js"></script>' : ""),
        }),
        new DuplicatePackageCheckerPlugin(),
    ],
    devServer: {
        host: '0.0.0.0'
    }
    }
}

module.exports = buildConfig;
