const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/main.tsx',

  // mode: 'production',
  mode: 'development',

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },

      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.css$/i,
        use: [{
          loader: MiniCssExtractPlugin.loader
        }
          , 'css-loader']
      }
    ]
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },

  // devtool: 'eval-cheap-module-source-map',

  devtool: 'inline-source-map',

  output: {
    filename: 'desktop_app.js',
    library: 'desktop_app',
    path: path.resolve(__dirname, './www/dist/js'),
    libraryTarget: 'umd',
  },

}