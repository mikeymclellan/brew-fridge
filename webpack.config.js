module.exports = {
    entry: './dashboard/js/src/main.jsx',
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
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    }
};


