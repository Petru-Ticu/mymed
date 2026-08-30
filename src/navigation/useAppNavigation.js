import { Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Shared Header / NavBar navigation so each screen does not copy the same handlers.

export function useAppNavigation() {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email;
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  const goTo = (screenName) => () => {
    navigation.navigate(screenName, { email: route.params?.email });
  };

  return {
    navigation,
    route,
    email,
    windowHeight,
    windowWidth,
    handleAccountPress: goTo('Accountsettings'),
    handleNotificationsPress: goTo('Notifications'),
    handleHomePress: goTo('Home'),
    handleMyAnalyticsPress: goTo('Myanalytics'),
    handleMyMedsPress: goTo('Mymeds'),
    handleMorePress: goTo('More'),
  };
}
