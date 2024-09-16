const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    extraNodeModules: {
      'react-native': __dirname + '/node_modules/react-native',
    },
  },
};