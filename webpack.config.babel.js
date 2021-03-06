import path from 'path'
import webpack from 'webpack'
import autoprefixer from 'autoprefixer'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const START = process.env.npm_lifecycle_event === 'start'
const BUILD = process.env.npm_lifecycle_event === 'build'

const config = {
  entry: './js/main.js',

  output: {
    path: './dist',
    filename: '[hash].js'
  },

  resolve: {
    extensions: ['', '.js', '.elm']
  },

  module: {
    noParse: /\.elm$/,
    preLoaders: [
      { test: /\.js$/, exclude: [path.resolve(__dirname, 'styles/'), /node_modules/], loader: 'eslint-loader' }
    ],
    loaders: [
      { test: /\.js$/, exclude: [/node_modules/], loader: 'babel-loader' },
      { test: /\.(png|jpg|gif|svg|ttf|otf|eot|svg|woff2?)$/, loader: 'url-loader?limit=8192' },
      { test: /\.elm$/, exclude: [/elm-stuff/, /node_modules/], loader: (START ? 'elm-hot!' : '') + 'elm-webpack?warn&pathToMake=node_modules/.bin/elm-make' }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'html/index.html',
      inject: 'body',
      minify: require('./html-minifier.json')
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],

  postcss: [ autoprefixer({ browsers: ['last 2 versions']} ) ],

  eslint: {
    failOnWarning: true,
    failOnError: true
  },

  devServer: {
    stats: 'errors-only'
  }
}

if (START) {
  config.module.loaders.push({ test: /\.less$/, loader: 'style!css!postcss-loader!less' })
}
if (BUILD) {
  // put styles in a separate file
  config.module.loaders.push({ test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css!postcss-loader!less') })
  config.plugins.push(new ExtractTextPlugin('[hash].css'))

  // disable UglifyJs warnings
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false }}))
}

export default config
