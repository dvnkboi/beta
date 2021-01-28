/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

// vue.config.js
module.exports = {
  pwa: {
    name: 'AmpUpRadio',
    themeColor: '#8f00df',
    msTileColor: '#8f00df',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppCache: "yes",
    appleMobileWebAppStatusBarStyle: 'black',

    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/sw.js',
      swDest: 'sw.js',
    },

    manifestOptions: {
      short_name:'AUR',
      background_color: "#1b1b1b"
    }
  },
  lintOnSave: process.env.NODE_ENV != 'production',
  configureWebpack: {
    mode: process.env.NODE_ENV == 'production' ? 'production' : 'development',
    loader: {
      test: /\.css(\?.*)?$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
    },
    plugins:[
      new CopyPlugin([
      {
        from: './src/assets',
        to: 'assets'
      },
      {
        from: 'node_modules/workbox-routing', 
        to: 'WorkBox'
      },
      {
        from: 'node_modules/workbox-expiration', 
        to: 'WorkBox'
      },
      {
        from: 'node_modules/workbox-strategies', 
        to: 'WorkBox'
      },
      {
        from: 'node_modules/workbox-core', 
        to: 'WorkBox'
      },
    ]),
    ],
    optimization: {
      removeAvailableModules: true,
      removeEmptyChunks: true,
      nodeEnv: 'production',
      splitChunks: {
        chunks: "async",
        minSize: 1000,
        maxSize: 10000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameMaxLength: 5,
        hidePathInfo: true,
        automaticNameDelimiter: '-',
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
      minimize: process.env.NODE_ENV == 'production',
      minimizer: [
        /* config.optimization.minimizer('terser') */
        new CssMinimizerPlugin(),
        new TerserPlugin(
          {
            terserOptions: {
              compress: {
                ecma: 6,
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
              mangle: true,
              sourceMap: true,
              cache: true,
              parallel: true,
              extractComments: false
            }
          }
        )
      ]
    }
  }
}


