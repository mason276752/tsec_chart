const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'src', 'udf-compatible-datafeed.ts'),
  watch: false,
  output: {
    path: __dirname + '/dist',
    publicPath: './datafeeds/udf/dist/',
    filename: "bundle.js",
    chunkFilename: '[name].js',
    library: 'Datafeeds',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /.ts?$/,
      include: [
        path.resolve(__dirname, 'src'),

      ],
      exclude: [
        path.resolve(__dirname, 'node_modules')
      ],
      loader: 'ts-loader',
    },
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.ts']
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: true
        }
      })
    ]
  },
  // devtool: 'source-map',
  // devServer: {
  //   contentBase: path.join('/dist/'),
  //   inline: true,
  //   host: '0.0.0.0',
  //   port: 8080,
  // }
};