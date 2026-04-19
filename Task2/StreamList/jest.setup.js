jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-community/blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props) => React.createElement(View, props),
  };
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Mock = (props) =>
    React.createElement(Text, props, props.name ?? 'icon');
  return Mock;
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Mock = (props) =>
    React.createElement(Text, props, props.name ?? 'ionicon');
  return Mock;
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  const LinearGradient = (props) =>
    React.createElement(View, props, props.children);
  return { default: LinearGradient };
});
