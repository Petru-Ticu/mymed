import React from 'react';
import { View, Text } from 'react-native';
import AppScreen, { screenStyles } from './layout/AppScreen';

export default function Home() {
  return (
    <AppScreen>
      <View style={screenStyles.body}>
        <Text style={screenStyles.title}>HOME</Text>
      </View>
    </AppScreen>
  );
}
