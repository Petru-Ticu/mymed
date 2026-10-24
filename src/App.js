// Root navigator. Tab screens wrap themselves in AppScreen (Header + NavBar).
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Welcome from './Welcome';
import { MedicalListProvider } from './MedicalListContext';
import { navigationRef } from './navigation/navigationRef';
import DoseReminderHost from './DoseReminderHost';
import { I18nProvider } from './i18n';
import ErrorBoundary from './ui/ErrorBoundary';


const Stack = createStackNavigator();
const hiddenHeader = { headerShown: false };

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
      <SafeAreaProvider>
        <MedicalListProvider>
          <I18nProvider>
          <NavigationContainer ref={navigationRef}>
            <DoseReminderHost>
            <Stack.Navigator screenOptions={hiddenHeader}>
              {/* First route: sign-up. MedicationTypingPage is lazy-loaded so calendar-picker does not run at startup. */}
              <Stack.Screen name="Welcome" component={Welcome} />
              <Stack.Screen
                name="Language_Selector"
                getComponent={() => require('./SelectLanguage').default}
              />
              <Stack.Screen
                name="Home"
                getComponent={() => require('./Home').default}
              />
              <Stack.Screen
                name="Myanalytics"
                getComponent={() => require('./Myanalytics').default}
              />
              <Stack.Screen
                name="Mymeds"
                getComponent={() => require('./Mymeds').default}
              />
              <Stack.Screen
                name="MedicationTypingPage"
                getComponent={() => require('./MedicationTypingPage').default}
              />
              <Stack.Screen
                name="MedicationScan"
                getComponent={() => require('./MedicationScan').default}
              />
              <Stack.Screen
                name="More"
                getComponent={() => require('./More').default}
              />
              <Stack.Screen
                name="Accountsettings"
                getComponent={() => require('./Accountsettings').default}
              />
              <Stack.Screen
                name="Notifications"
                getComponent={() => require('./Notifications').default}
              />
            </Stack.Navigator>
            </DoseReminderHost>
          </NavigationContainer>
          </I18nProvider>
        </MedicalListProvider>
      </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;
