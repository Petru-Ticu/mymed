const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo Go does not ship lock-screen notifications, BLE, or the Worklets
// native entry used by Reanimated 4. Keep those packages for native builds;
// replace them with a throwing stub only when publishing the Expo Go preview.
if (process.env.MYMED_EXPO_GO === '1') {
  const stub = path.resolve(__dirname, 'metro.expoGoStub.js');
  const blocked = new Set([
    'expo-notifications',
    'react-native-ble-plx',
    'react-native-worklets',
    'react-native-reanimated',
  ]);
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (blocked.has(moduleName)) {
      return { type: 'sourceFile', filePath: stub };
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
