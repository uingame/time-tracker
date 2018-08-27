const path = require('path');
const rimraf = require('rimraf')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin')

const NODE_ENV = process.env.NODE_ENV || 'development'

const paths = {
  src: path.join(__dirname, 'src/client'),
  html: path.join(__dirname, 'src/client/index.html'),
  temp: path.join(__dirname, '_build'),
  dist: path.join(__dirname, 'dist'),
  node_modules: path.join(__dirname, 'node_modules')
}

class PostBuildPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('PostBuildPlugin', () => {
      rimraf(paths.temp, () => console.log(`Removed ${paths.temp}`))
    })
  }
}

const common = {
  entry: path.join(paths.src, 'index.js'),
  output: {
    filename: 'bundle.js',
    path: paths.dist
  },
  resolve: {
    modules: [paths.src, paths.node_modules],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
        exclude: paths.node_modules
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: paths.html
    })
  ]
}

const development = {
  mode: 'development',
  entry: [
    'react-hot-loader/patch',
    paths.src,
  ],
  devtool: 'source-map',
  devServer: {
    hot: true,
    inline: true,
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: true,
    port: 8080,
    proxy: {
      "/api": {
        target: "http://0.0.0.0:3000"
      }
    }

  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
        exclude: paths.node_modules
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}

const production = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: paths.node_modules
      }, {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin([paths.dist, paths.temp]),
    new PostBuildPlugin()
  ]
}

module.exports = NODE_ENV === 'development' ?
  merge(common, development) :
  merge(common, production)
