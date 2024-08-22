const withTM = require('next-transpile-modules')(['@ant-design/icons']);

module.exports = withTM({
  transpileModules: ['@ant-design/icons'],
  reactStrictMode: true,
});