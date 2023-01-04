import webpack from 'webpack';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extractCSS = new MiniCssExtractPlugin();
const overpassTest = /overpass-.*\.(woff2?|ttf|eot|otf)(\?.*$|$)/;

// use type annotation instead of TS type
/** @type {import('webpack').Configuration} */
const config = {
  mode: 'development',
  context: path.resolve(__dirname, './src'),
  entry: './index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-bundle.js',
    chunkFilename: '[name]-chunk.js',
    publicPath: './'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /(\.jsx?)|(\.tsx?)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
            },
          },
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
            /** @type {import('sass-loader').Options} */
            options: {
              sourceMap: true,
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