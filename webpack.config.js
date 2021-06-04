const path = require('path')
const webpack = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require("progress-bar-webpack-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const env = process.env.NODE_ENV || 'dev'
const isDev = env === 'dev'
const version = '1.0.0'
const lessModuleRegex = /\.module\.less$/

module.exports = () => {
  const options = {
    target: "web",
    mode: isDev ? 'development' : 'production',
    entry: isDev ? './example/index' : './src/index',
    output: {
      filename: '[name].[hash].js',
      path: path.join(__dirname, 'dist'),
      chunkFilename: `${version}/[name].[contenthash].js`,
      publicPath: isDev ? '/' : './',
    },
    devServer: {
      compress: !isDev,
      clientLogLevel: 'warning',
      hot: true,
      inline: true,
      port: 8888,
      host: '0.0.0.0',
    },
    watchOptions: {
      ignored: /node_modules/,
    },
    module: {
      rules: [
        {
          test: /\.(j|t)s[x]?$/,
          use: [{
            loader: require.resolve('babel-loader'),
            options: {
              cacheDirectory: true,
              plugins: [
                "@babel/plugin-proposal-class-properties",
              ]
            },
          }],
          include: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'example')
          ],
        },
        {
          test: /\.(le|c)ss$/,
          exclude: [/\.module\.css$/, lessModuleRegex],
          use: isDev
            ? [
              { loader: "style-loader" },
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1
                }
              },

              {
                loader: "postcss-loader",
                options: { sourceMap: true }
              },
              {
                loader: "less-loader",
                options: {
                  sourceMap: true,
                  lessOptions: {
                    javascriptEnabled: true
                  }
                }
              }]
            : [MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
            {
              loader: "less-loader",
              options: {
                sourceMap: false,
                lessOptions: {
                  javascriptEnabled: true
                }
              }
            }
            ],
        },
        {
          test: lessModuleRegex,
          include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'example')],
          use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:5]'
                },
              },
            },
            'postcss-loader',
          ],
        },
        {
          test: /\.(jpg|jpeg|png|gif|cur|ico|eot|ttf|svg|woff|woff2)$/,
          exclude: [path.resolve(__dirname, './src/assets/icons')],
          use: [
            {
              loader: "file-loader",
              options: {
                name: `${version}/[name].[hash:8].[ext]`,
                limit: 50000
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: [".js", ".jsx", ".json", ".less", ".css"],
      enforceExtension: false,
    },
    optimization: {
      concatenateModules: true,
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors"
          },
          commons: {
            name: "commons",
            minChunks: 2,
            chunks: "initial"
          },
          styles: {
            name: "styles",
            test: /\.css$/,
            chunks: "all",
            minChunks: 2,
            enforce: true
          }
        }
      },
      minimizer: isDev
        ? []
        : [
          new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: false,
            uglifyOptions: {
              compress: {
                drop_debugger: false,
                drop_console: false  //调试打时开
              }
            }
          }),
          new OptimizeCssAssetsPlugin({
            cssProcessor: require("cssnano"),
            cssProcessorOptions: { discardComments: { removeAll: true } },
            canPrint: true
          })
        ],
    },
    plugins: [
      new ProgressBarPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      }),
      new webpack.ProvidePlugin({
        React: 'react',
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        options: {
          runtimeChunk: {
            name: "runtime"
          }
        }
      }),
      new HtmlWebpackPlugin({
        title: "align-tool",
        filename: "index.html",
        inject: true,
        template: path.resolve(__dirname, "./example/index.html"),
        hash: true
      })
    ],
  }
  if (isDev) {
    options.plugins = options.plugins.concat([new webpack.HotModuleReplacementPlugin()])
    options.devtool = 'cheap-module-eval-source-map'
  } else {
    options.plugins = options.plugins.concat([
      new CleanWebpackPlugin(),
      new HardSourceWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: `${version}/[name].css`,
        chunkFilename: `${version}/[name].[contenthash].css`,
      }),
    ])
  }

  return options
}





