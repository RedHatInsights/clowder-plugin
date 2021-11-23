/* eslint-env node */

import * as webpack from 'webpack';
import * as path from 'path';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk/lib/index-webpack';

const extractCSS = new MiniCssExtractPlugin();
const overpassTest = /overpass-.*\.(woff2?|ttf|eot|otf)(\?.*$|$)/;

const config: webpack.Configuration = {
  mode: 'development',
  context: path.resolve(__dirname, 'src'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-bundle.js',
    chunkFilename: '[name]-chunk.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /(\.jsx?)|(\.tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules\/(?!(@patternfly)\/).*/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
            },
          },
          { loader: 'cache-loader' },
          { loader: 'thread-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              outputStyle: 'compressed',
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot|otf)(\?.*$|$)/,
        exclude: overpassTest,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    extractCSS,
    new ConsoleRemotePlugin(),
    new webpack.EnvironmentPlugin({
      REACT_APP_API_ROOT: '',
      REACT_APP_BUILD_MODE: '',
    }),
  ],
  devtool: 'source-map',
  optimization: {
    chunkIds: 'named',
    minimize: false,
  },
  externals: {
    '@openshift-console/dynamic-plugin-sdk/api': 'api',
  },
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';
  config.output.filename = '[name]-bundle-[hash].min.js';
  config.output.chunkFilename = '[name]-chunk-[chunkhash].min.js';
  config.optimization.chunkIds = 'deterministic';
  config.optimization.minimize = true;
}

export default config;