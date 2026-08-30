import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppNavigation } from './navigation/useAppNavigation';
import { colors } from './theme/colors';

const tabs = [
  { key: 'home', label: 'HOME', Icon: Icon, iconName: 'home-sharp', handler: 'handleHomePress' },
  { key: 'analytics', label: 'MyANALYTICS', Icon: MaterialIcons, iconName: 'analytics', handler: 'handleMyAnalyticsPress' },
  { key: 'meds', label: 'MyMEDS', Icon: MaterialCommunityIcons, iconName: 'pill', handler: 'handleMyMedsPress' },
  { key: 'more', label: 'MORE', Icon: MaterialCommunityIcons, iconName: 'dots-horizontal', handler: 'handleMorePress' },
];

export default function NavBar() {
  const nav = useAppNavigation();
  const { windowHeight } = nav;
  const insets = useSafeAreaInsets();
  // Keep 5% from the bottom, but never sit under the home indicator / Android nav bar.
  const bottomOffset = Math.max(windowHeight * 0.05, insets.bottom);

  return (
    <View style={[styles.navBarContainer, { bottom: bottomOffset }]}>
      {tabs.map((tab) => {
        const TabIcon = tab.Icon;
        return (
          <Pressable key={tab.key} onPress={nav[tab.handler]} style={styles.button}>
            <View style={styles.buttonContent}>
              <TabIcon name={tab.iconName} size={26} color={colors.text} />
              <Text style={styles.buttonText}>{tab.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    flexDirection: 'row',
    height: '10.5%',
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  button: {
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});
