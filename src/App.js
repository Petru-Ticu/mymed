// Root navigator. Tab screens wrap themselves in AppScreen (Header + NavBar).
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Welcome from './Welcome';
import LanguageSelector from './SelectLanguage';
import Home from './Home';
import Mymeds from './Mymeds';
import More from './More';
import Accountsettings from './Accountsettings';
import Notifications from './Notifications';
import { MedicalListProvider } from './MedicalListContext';
import { navigationRef } from './navigation/navigationRef';
import DoseReminderHost from './DoseReminderHost';


const Stack = createStackNavigator();
const hiddenHeader = { headerShown: false };

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MedicalListProvider>
          <NavigationContainer ref={navigationRef}>
            <DoseReminderHost>
            <Stack.Navigator screenOptions={hiddenHeader}>
              {/* First route: sign-up. MedicationTypingPage is lazy-loaded so calendar-picker does not run at startup. */}
              <Stack.Screen name="Welcome" component={Welcome} />
              <Stack.Screen name="Language_Selector" component={LanguageSelector} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen
                name="Myanalytics"
                getComponent={() => require('./Myanalytics').default}
              />
              <Stack.Screen name="Mymeds" component={Mymeds} />
              <Stack.Screen
                name="MedicationTypingPage"
                getComponent={() => require('./MedicationTypingPage').default}
              />
              <Stack.Screen name="More" component={More} />
              <Stack.Screen name="Accountsettings" component={Accountsettings} />
              <Stack.Screen name="Notifications" component={Notifications} />
            </Stack.Navigator>
            </DoseReminderHost>
          </NavigationContainer>
        </MedicalListProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
