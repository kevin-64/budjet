const path = require('path');

module.exports = {
  entry: './content/pages/index.tsx',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist', 'pages'),
  },
  devServer: {
    contentBase: path.join(__dirname, "content/pages"),
    port: 3000,
    publicPath: "http://localhost:3000/dist/",
    hotOnly: true
  }
};