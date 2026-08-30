import React from 'react';
import { View, Text } from 'react-native';
import AppScreen, { screenStyles } from './layout/AppScreen';

export default function More() {
  return (
    <AppScreen>
      <View style={screenStyles.body}>
        <Text style={screenStyles.title}>MORE</Text>
      </View>
    </AppScreen>
  );
}
