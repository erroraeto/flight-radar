const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: './src/script.tsx',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/flight-radar/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new StylelintWebpackPlugin({
      files: '{**/*,*}.sass',
    }),
    new EslintWebpackPlugin({
      files: '{**/*, *}.{tsx,ts,js}',
      failOnError: false,
    }),
  ],
  devServer: {
    open: true,
    port: 3000,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
    proxy: [
      {
        context: ['/adsb'],
        target: 'https://api.adsb.lol',
        changeOrigin: true,
        secure: true,
        pathRewrite: { '^/adsb': '' },
      },
    ],
  },
};
