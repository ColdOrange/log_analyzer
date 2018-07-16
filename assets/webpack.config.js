const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractApp = new ExtractTextPlugin('../css/app.css');
const extractAntd = new ExtractTextPlugin('../css/antd.css');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, './static/js')
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, './src')
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'react', 'stage-0'],
          }
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: extractApp.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[path][name]-[local]',
            }
          }
        })
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: extractAntd.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
          }
        })
      }
    ]
  },
  plugins: [
    extractApp,
    extractAntd
  ]
};
