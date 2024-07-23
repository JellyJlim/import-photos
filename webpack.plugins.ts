import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import type ICopyPlugin from 'copy-webpack-plugin'

import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin: typeof ICopyPlugin = require('copy-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src', 'ps'),
        to: path.resolve(__dirname, '.webpack/main', 'ps')
      },
    ],
  }),
];
