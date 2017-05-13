var webpack = require('webpack');
var path = require('path');


module.exports = {
    entry: ['whatwg-fetch', // https://github.com/github/fetch
        './dashboard/src/js/main.jsx',
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
        loaders: [
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
                loader: "style-loader!css-loader!autoprefixer-loader!less-loader"
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
            jQuery: "jquery"
        })
    ]
};
