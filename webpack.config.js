const path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.join(__dirname, 'dist'),
        library: 'pcs-react',
        libraryTarget: 'umd'
    }, 
    externals: {
        "bootstrap": "bootstrap",
        "d3": "d3",
        "bigi": "bigi",
        "bs58": "bs58",
        "pcs-js-eos": "pcs-js-eos",
        "react": "react",
        "react-dom": "react-dom",
        "react-scripts": "react-scripts",
        "react-tweet-embed": "react-tweet-embed",
        "reactstrap": "reactstrap"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
            }
        ]
    }
};
