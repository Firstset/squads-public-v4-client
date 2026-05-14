const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

const CONFIGURABLE_ENV_KEYS = [
  'DEFAULT_RPC_URL',
  'DEFAULT_PROGRAM_ID',
  'DEFAULT_EXPLORER_URL',
  'DEFAULT_MULTISIG_ADDRESS',
  'FRONTEND_AUTH_SECRET',
];

function parseDotEnvFile(filename) {
  const filePath = path.resolve(__dirname, filename);
  if (!fs.existsSync(filePath)) return {};
  const parsed = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }
  return parsed;
}

// Precedence: real process.env (e.g. Vercel) > .env.local > .env > built-in fallback.
const dotenv = { ...parseDotEnvFile('.env'), ...parseDotEnvFile('.env.local') };
const definedEnv = {};
for (const key of CONFIGURABLE_ENV_KEYS) {
  const value = process.env[key] ?? dotenv[key] ?? '';
  definedEnv[`process.env.${key}`] = JSON.stringify(value);
}

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Unique file name per build
    // chunkFilename: '[name].[contenthash].js', // Ensure chunks get unique names
    clean: true,
    assetModuleFilename: 'assets/[hash][ext][query]',
    pathinfo: false,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      assert: require.resolve('assert/'),
      util: require.resolve('util/'),
      events: require.resolve('events/'),
      process: require.resolve('process/browser.js'),
      buffer: require.resolve('buffer/'),
    },
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@solana/web3.js': path.resolve(__dirname, 'node_modules/@solana/web3.js'),
      'process/browser': path.resolve(__dirname, 'node_modules/process/browser.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin(definedEnv),
  ],
};
