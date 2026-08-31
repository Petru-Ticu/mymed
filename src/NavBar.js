import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppNavigation } from './navigation/useAppNavigation';
import { colors } from './theme/colors';
import { layout } from './theme/layout';
import { useI18n } from './i18n';

const tabs = [
  { key: 'home', route: 'Home', labelKey: 'nav.home', Icon: Icon, iconName: 'home-sharp', handler: 'handleHomePress' },
  { key: 'analytics', route: 'Myanalytics', labelKey: 'nav.analytics', Icon: MaterialIcons, iconName: 'analytics', handler: 'handleMyAnalyticsPress' },
  { key: 'meds', route: 'Mymeds', labelKey: 'nav.meds', Icon: MaterialCommunityIcons, iconName: 'pill', handler: 'handleMyMedsPress' },
  { key: 'more', route: 'More', labelKey: 'nav.more', Icon: MaterialCommunityIcons, iconName: 'dots-horizontal', handler: 'handleMorePress' },
];

export default function NavBar() {
  const nav = useAppNavigation();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const currentRoute = useNavigationState((state) => state?.routes?.[state.index]?.name);

  return (
    <View style={[styles.navBarContainer, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => {
        const TabIcon = tab.Icon;
        const selected = currentRoute === tab.route;
        return (
          <Pressable
            key={tab.key}
            onPress={nav[tab.handler]}
            style={[styles.button, selected ? styles.buttonSelected : null]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t(tab.labelKey)}
          >
            <View style={styles.buttonContent}>
              <TabIcon name={tab.iconName} size={24} color={colors.text} />
              <Text style={[styles.buttonText, selected ? styles.buttonTextSelected : null]}>
                {t(tab.labelKey)}
              </Text>
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
    minHeight: layout.navBarHeight,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  buttonSelected: {
    backgroundColor: colors.accentStrong,
  },
  buttonText: {
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  buttonTextSelected: {
    fontWeight: 'bold',
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});
