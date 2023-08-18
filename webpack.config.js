const path = require('path');

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
