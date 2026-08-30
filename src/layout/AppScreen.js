import React from 'react';
import { StyleSheet, View } from 'react-native';
import Header from '../Header';
import NavBar from '../NavBar';
import { colors } from '../theme/colors';

// Standard tab screen chrome: header on top, page content, navbar at the bottom.
export default function AppScreen({ children }) {
  return (
    <View style={screenStyles.container}>
      <Header />
      {children}
      <NavBar />
    </View>
  );
}

export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    color: colors.text,
    fontWeight: 'bold',
    margin: 10,
  },
});
