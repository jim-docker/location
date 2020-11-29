/* eslint @typescript-eslint/no-var-requires: "off" */

const path = require("path");

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = [
  {
    entry: "./main.ts",
    context: __dirname,
    target: "electron-main",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },

        {
          test: /\.(gif|svg|jpg|png)$/,
          loader: "file-loader"
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader, 'css-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,'css-loader','sass-loader'
          ]
        }
      ],
    },
    externals: [
      {
        "@k8slens/extensions": "var global.LensExtensions",
        "mobx": "var global.Mobx",
        "react": "var global.React"
      }
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "./images/layers.png$": path.resolve(
            __dirname,
            "./node_modules/leaflet/dist/images/layers.png"
        ),
        "./images/layers-2x.png$": path.resolve(
            __dirname,
            "./node_modules/leaflet/dist/images/layers-2x.png"
        ),
        "./images/marker-icon.png$": path.resolve(
            __dirname,
            "./node_modules/leaflet/dist/images/marker-icon.png"
        ),
        "./images/marker-icon-2x.png$": path.resolve(
            __dirname,
            "./node_modules/leaflet/dist/images/marker-icon-2x.png"
        ),
        "./images/marker-shadow.png$": path.resolve(
            __dirname,
            "./node_modules/leaflet/dist/images/marker-shadow.png"
        )
      }
    },
    output: {
      libraryTarget: "commonjs2",
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
    },
  },
  {
    entry: "./renderer.tsx",
    context: __dirname,
    target: "electron-renderer",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    externals: [
      {
        "@k8slens/extensions": "var global.LensExtensions",
        "react": "var global.React",
        "mobx": "var global.Mobx"
      }
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      libraryTarget: "commonjs2",
      globalObject: "this",
      filename: "renderer.js",
      path: path.resolve(__dirname, "dist"),
    },
    node: {
      __dirname: false,
      __filename: false
    }
  },
];
