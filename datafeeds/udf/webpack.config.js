const path = require('path');

console.log(__dirname + '/dist')
module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'udf-compatible-datafeed.ts'),
  watch: true,
  output: {
    path: __dirname + '/dist',
    publicPath: '/dist/',
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
    // {
    //   loader: 'file-loader',
    //   // Exclude `js` files to keep "css" loader working as it injects
    //   // its runtime that would otherwise be processed through "file" loader.
    //   // Also exclude `html` and `json` extensions so they get processed
    //   // by webpacks internal loaders.
    //   exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
    //   options: {
    //     name: 'static/media/[name].[hash:8].[ext]',
    //   },
    // },
  ]
  },
  resolve: {
    extensions: ['.json', '.js', '.ts']
  },
  devtool: 'source-map',
  // devServer: {
  //   contentBase: path.join('/dist/'),
  //   inline: true,
  //   host: '0.0.0.0',
  //   port: 8080,
  // }
};