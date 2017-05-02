module.exports = {
    entry: ['./dashboard/js/src/main.jsx',
        './dashboard/css/main.less']
        ,
    output: {
        filename: './dashboard/js/build/main.js'
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
                test: /\.less$/,
                loader: "style-loader!css-loader!autoprefixer-loader!less-loader"
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    }
};


