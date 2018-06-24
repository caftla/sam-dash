const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OfflinePlugin = require('offline-plugin')

module.exports = {
  mode: 'production',
  entry: {
    main: resolve(__dirname, '../src'),
    vendor: [
      'react-redux',
      'react-router-dom',
      'redux',
      'redux-thunk',
      'styled-components',
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: resolve(__dirname, '../dist'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      moment: 'moment/moment.js',
    }
  },
  module: {
    rules: [
      {
        test: /\.purs$/,
        exclude: /node_modules/,
        loader: 'purs-loader',
        options: {
          src: [
            'bower_components/purescript-*/src/**/*.purs',
            'src/**/*.purs'
          ],
          pscIde: true
        }
      },
      {
        test: /\.(js|jsx)$/,
        include: [resolve(__dirname, '../src')],
        loader: 'babel-loader',
        options: {
          presets: ["es2017", "es2015", "react", "stage-0"],
        },
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
          'style-loader',
          'css-loader',
          {
            loader: 'stylus-loader'
          },
        ],
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.api_root': JSON.stringify(process.env.api_root || ''),
      'process.env.finance_email': JSON.stringify(process.env.finance_email || '')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'Sigma',
      template: 'webpack/template.html'
    }),
    // new OfflinePlugin({
    //   ServiceWorker: {
    //     navigateFallbackURL: '/',
    //   },
    //   AppCache: false,
    // })
  ],
}
