const path = require('path');
// TODO remove this config file if not using WebPack. So far it is not used for bundling.
module.exports =
{
  entry: './public/preload.js',
  mode: 'development',
  resolve:
  {
    fallback: { "path": require.resolve("path-browserify"), "fs" : false } // TODO fix fs so you can use webpack to bundle preload.js
  },
  output:
  {
    filename: 'preload.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: []
};
