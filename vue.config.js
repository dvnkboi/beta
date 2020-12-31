/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// vue.config.js
module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    loader: {
      test: /\.css(\?.*)?$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
    },
    optimization: {
      removeAvailableModules: true,
      removeEmptyChunks: true,
      nodeEnv: 'production',
      splitChunks: {
        chunks: "async",
        minSize: 10000,
        maxSize:30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameMaxLength:8,
        hidePathInfo:true,
        automaticNameDelimiter:'-',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          }
        }
      },
      minimizer: [
        /* config.optimization.minimizer('terser') */
        new CssMinimizerPlugin(),
        new TerserPlugin(
          {
            terserOptions: {
              compress: {
                arrows: true,
                collapse_vars: true,
                comparisons: true,
                computed_props: true,
                hoist_funs: true,
                hoist_props: true,
                hoist_vars: true,
                inline: true,
                loops: true,
                negate_iife: true,
                properties: true,
                reduce_funcs: true,
                reduce_vars: true,
                switches: true,
                toplevel: true,
                typeofs: true,
                booleans: true,
                if_return: true,
                sequences: true,
                unused: true,
                conditionals: true,
                dead_code: true,
                evaluate: true
              },
              mangle: {
                safari10: true
              }
            },
            sourceMap: true,
            cache: true,
            parallel: true,
            extractComments: false
          }
        )
      ]
    },
  }
}


