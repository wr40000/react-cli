// Node.js的核心模块，专门用来处理文件路径
const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isProduction = process.env.NODE_ENV === 'production'
// 返回处理样式loader函数
const getStyleLoaders = (pre) => {
  return [
    isProduction ? MiniCssExtractPlugin.loader : "style-loader",
    "css-loader",
    {
      // 处理css兼容性问题
      // 配合package.json中browserslist来指定兼容性
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"],
        },
      },
    },
    pre && {
      loader: pre,
      options:
        pre === "less-loader"
          ? {
              // antd自定义主题配置
              // 主题色文档：https://ant.design/docs/react/customize-theme-cn#Ant-Design-%E7%9A%84%E6%A0%B7%E5%BC%8F%E5%8F%98%E9%87%8F
              lessOptions: {
                modifyVars: { "@primary-color": "#000000" },
                javascriptEnabled: true,
              },
            }
          : {},
    },
  ].filter(Boolean);
};

module.exports = {
  // 入口
  // 相对路径和绝对路径都行
  entry: "./src/main.js",
  output: {
    // path: 文件输出目录，必须是绝对路径
    // path.resolve()方法返回一个绝对路径
    // __dirname 当前文件的文件夹绝对路径
    path: isProduction ? path.resolve(__dirname, "../dist") : undefined, // 生产模式需要输出
    // filename: 输出文件名
    filename: isProduction ? "static/js/[name].[contenthash:8].js" : 
                            "static/js/[name].js", // 入口文件打包输出资源命名方式
    chunkFilename: isProduction ? "static/js/[name].[contenthash:8].chunk.js" : 
                                "static/js/[name].chunk.js", // 动态导入输出资源命名方式
    assetModuleFilename: "static/media/[name].[hash][ext]", // 图片、字体等资源命名方式（注意用hash）
    clean: true,
  },
  // 加载器
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: getStyleLoaders(),
      },
      {
        test: /\.less$/i,
        use: getStyleLoaders("less-loader"),
      },
      {
        test: /\.styl$/i,
        use: getStyleLoaders("stylus-loader"),
      },
      {
        test: /\.s[ac]ss/i,
        use: getStyleLoaders("sass-loader"),
      },
      {
        // 正则表达式不要加 g
        test: /\.(jpe?g|png|gif|webp)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
          },
        },
        // generator: {
        //   // 将图片文件输出到 static/imgs 目录中
        //   // 将图片文件命名 [hash:8][ext][query]
        //   // [hash:8]: hash值取8位
        //   // [ext]: 使用之前的文件扩展名
        //   // [query]: 添加之前的query参数
        //   filename: "static/images/[name].[hash:8][ext][query]",
        // },
      },
      {
        // 正则表达式不要加 g
        test: /\.(ttf|woff|woff2|map4|map3|avi)$/,
        type: "asset/resource",
        // generator: {
        //   // 将图片文件输出到 static/imgs 目录中
        //   // 将图片文件命名 [hash:8][ext][query]
        //   // [hash:8]: hash值取8位
        //   // [ext]: 使用之前的文件扩展名
        //   // [query]: 添加之前的query参数
        //   filename: "static/media/[name].[hash:8][ext][query]",
        // },
      },
      {
        test: /\.jsx?$/,
        // exclude: /node_modules/, // 排除node_modules代码不编译
        include: path.resolve(__dirname, "../src"), // 也可以用包含
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true, // 开启babel编译缓存
              cacheCompression: false, // 缓存文件不要压缩
              plugins: [
                !isProduction && "react-refresh/babel"  // 激活js的HMR
              ].filter(Boolean),
            },
          },
        ],
      },
    ],
  },
  // 插件
  plugins: [
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintcache"
      ),
    }),
    new HTMLWebpackPlugin({
      // HTML模版所在位置
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    isProduction && new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css",
      chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
    }),

    isProduction &&
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "../public"),
            to: path.resolve(__dirname, "../dist"),
            globOptions: {
              // 忽略index.html文件
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
    !isProduction && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  optimization: {
    minimize: isProduction,
    minimizer: [
        new CssMinimizerPlugin(),
        new TerserWebpackPlugin(),
    ],
    splitChunks: {
      // 代码分割配置
      chunks: "all", // 对所有模块都进行分割
      // 以下是默认值
      // minSize: 20000, // 分割代码最小的大小
      // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
      // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
      // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
      // maxInitialRequests: 30, // 入口js文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
      cacheGroups: {
        // 组，哪些模块要打包到一个组
        react: {
          // 组名
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/, // 需要打包到一起的模块
          priority: 40, // 权重（越大越高）
          name: "react-chunk"
        },
        antd: {
          // 组名
          test: /[\\/]node_modules[\\/]antd[\\/]/, // 需要打包到一起的模块
          priority: 30, // 权重（越大越高）
          name: "antd-chunk"
        },
        libs: {
          // 组名
          test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
          priority: 20, // 权重（越大越高）
          name: "lib-chunk"
        },
      },
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`, // runtime文件命名规则
    },
  },
  resolve:{
    extensions: ['.jsx', '.js', '.json']
  },
  devServer:{
    host: "localhost",
    port: 3000,
    open: true,
    hot: true, // 开启HMR   
    historyApiFallback: true  // 解决前端路由刷新404问题
  },
  // 模式
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "source-map" : "cheap-module-source-map",
  performance: false , // 关闭性能分析，提升打包速度
};
