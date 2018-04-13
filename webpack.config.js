var webpack = require('webpack');
var path = require('path');


module.exports = {
    mode: 'development',
    entry: ['whatwg-fetch', // https://github.com/github/fetch
        './dashboard/src/js/index.js',
        './dashboard/src/css/main.less']
        ,
    output: {
        path: path.resolve(__dirname, 'dashboard/build/js/'),
        filename: '[name].js',
        publicPath: 'build/js/'
    },
    devServer:{
        contentBase: 'dashboard'
    },
    module: {
        rules: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.less$|\.css$/,
                use: [{
                    loader: 'style-loader' // creates style nodes from JS strings
                }, {
                    loader: 'css-loader' // translates CSS into CommonJS
                }, {
                    loader: 'postcss-loader' // translates CSS into CommonJS
                    ,
                        options: {
                            postcss: []}
                }, {
                    loader: 'less-loader', // compiles Less to CSS
                    options: {
                        strictMath: true
                    }
                }]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/i,
                loader:'file-loader',
                options: {
                    name: 'dashboard/build/assets/[name].[hash].[ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            Popper: ['popper.js', 'default']
        })
    ]
};
