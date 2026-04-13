module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      alias: {
        '@api': './src/api',
        '@components': './src/components',
        '@hooks': './src/hooks',
        '@navigation': './src/navigation',
        '@screens': './src/screens',
        '@store': './src/store',
        '@theme': './src/theme',
        '@utils': './src/utils',
        '@assets': './src/assets',
      },
    }],
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      safe: false,
      allowUndefined: true,
    }],
  ],
};
