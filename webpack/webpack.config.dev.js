const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = true

module.exports = {
  mode: 'development',
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client',
    'webpack/hot/only-dev-server',
    resolve(__dirname, 'hotReload'),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname),
    publicPath: '/',
  },
  context: resolve(__dirname, '../src'),
  resolve: {
    alias: {
      moment: 'moment/moment.js',
    }
  },
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    host: '127.0.0.1',
    contentBase: resolve(__dirname, '../assets'),
    publicPath: '/',
    historyApiFallback: true,
    proxy: {
      '/api/*': {
        target: 'http://127.0.0.1:3081/', // 'https://api.ipify.org/',
        changeOrigin: true,
        ws: true,
      }
    },
    historyApiFallback: {
      disableDotRule: true
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [resolve(__dirname, '../src'), resolve(__dirname)],
        use: 'babel-loader',
      },
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: {
          loader: 'elm-webpack-loader',
          options: {}
        }
      },
      {
        test: /\.styl$/,
        use: [
          'css-hot-loader',
          // MiniCssExtractPlugin.loader,
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'css-hot-loader',
          // ExtractTextPlugin.loader,
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    // new MiniCssExtractPlugin('style.css'),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
    new HtmlWebpackPlugin({
      title: 'Sigma',
      template: '../webpack/template.html',
    }),
    new webpack.DefinePlugin({
      'process.env.api_root': JSON.stringify(process.env.api_root || ''),
      'process.env.finance_email': JSON.stringify(process.env.finance_email || '')
    })
  ],
  performance: { hints: false },
}
