/**
 * Native entry. Expo also loads App.tsx, which re-exports src/App.
 */
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
