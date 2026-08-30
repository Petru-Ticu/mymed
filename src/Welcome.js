import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Pressable, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import {
  getWelcomeConfirmPasswordError,
  getWelcomeEmailError,
  getWelcomePasswordError,
} from './utils/inputRules';
import { userAppState, sessionStore } from './userStore';
import { styles } from './Welcome.styles';


export default function Welcome({ navigation }) {
  const route = useRoute(); // Access the current route to retrieve parameters

  // Define state variables to manage form inputs and their respective error messages
  const [email, setEmail] = useState(''); // State for storing email input
  const [password, setPassword] = useState(''); // State for storing password input
  const [confirmPassword, setConfirmPassword] = useState(''); // State for storing confirm password input
  const emailRef = useRef(null); // Reference for the email input field to manage focus
  const passwordRef = useRef(null); // Reference for the password input field to manage focus
  const confirmPasswordRef = useRef(null); // Reference for the confirm password input field to manage focus
  const [errorEmail, setErrorEmail] = useState(''); // State for storing email error messages
  const [errorPassword, setErrorPassword] = useState(''); // State for storing password error messages
  const [errorConfirmPassword, setErrorConfirmPassword] = useState(''); // State for storing confirm password error messages

  // Retrieve the selected language from route parameters, defaulting to English ('en') if not provided
  const selectedLanguage = route.params?.selectedLanguage || 'en';
  

  //function that validates the sign up when the user presses the Continue button.
  const onPressHandler = () => {
    let isValid = true; // Flag to track the validity of the form

    const emailError = getWelcomeEmailError(email);
    const passwordError = getWelcomePasswordError(password);
    const confirmError = getWelcomeConfirmPasswordError(password, confirmPassword);
    setErrorEmail(emailError);
    setErrorPassword(passwordError);
    setErrorConfirmPassword(confirmError);
    if (emailError || passwordError || confirmError) {
      isValid = false;
    }

    // Navigate to 'Home' screen if the form is valid
    if (isValid) {
      sessionStore.save({ email, selectedLanguage });
      userAppState.debugLog();
      navigation.navigate('Home', { selectedLanguage, email });
    }
  };

  // Function to navigate to the language selector screen
  const onPressHandlerSelectLang = () => {
    navigation.navigate('Language_Selector', { selectedLanguage });
  };  

  // Update selectedLanguage when route.params changes
  useEffect(() => {
    if (route.params?.selectedLanguage) {
      navigation.setParams({ selectedLanguage: route.params.selectedLanguage });
    }
  }, [route.params?.selectedLanguage]);

  // Function to handle the submission of the email field and focus on the password field
  const onSubmitEmail = () => {
    passwordRef.current.focus();
  };

  // Function to handle the submission of the password field and focus on the confirm password field
  const onSubmitPassword = () => {
    confirmPasswordRef.current.focus();
  };

  // Function to validate email input as the user types
  const validateEmail = (text) => {
    setErrorEmail(getWelcomeEmailError(text));
    setEmail(text); // Update email state
  };

  // Function to validate password input as the user types
  const validatePassword = (text) => {
    setErrorPassword(getWelcomePasswordError(text));
    setPassword(text);
  };

  // Function to validate confirm password input as the user types
  const validateConfirmPassword = (text) => {
    setErrorConfirmPassword(getWelcomeConfirmPasswordError(password, text));
    setConfirmPassword(text); // Add this line  
  };
  
  // Effect hook to handle logic when the screen gains focus
  useFocusEffect(() => {
    if (route.params?.selectedLanguage) {
      // Do something with the selectedLanguage value
      console.log('Selected Language:', route.params.selectedLanguage);
    }
  });

    return (
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.body}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.text}>Welcome to myMed</Text>
            <View style={{ alignSelf: 'flex-start', marginTop: 20 }}>
              <Text style={styles.textSL}>Sign up:</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errorEmail ? { borderColor: 'red' } : null,
                ]}
                placeholderTextColor="#000000"
                backgroundColor="#ffffff"
                borderRadius={5}
                ref={emailRef}
                onChangeText={validateEmail} // Update this line
                value={email}
                placeholder="Ex: john_doe@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={onSubmitEmail}
              />
              {errorEmail ? <Text style={styles.errorText}>{errorEmail}</Text> : null}
              <TextInput
                style={[
                  styles.input,
                  errorPassword ? { borderColor: 'red' } : null,
                ]}
                placeholderTextColor="#000000"
                backgroundColor="#ffffff"
                borderRadius={5}
                ref={passwordRef}
                onChangeText={validatePassword} // Update this line
                value={password}
                placeholder="Password (at least 8 characters)"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={onSubmitPassword}
              />
              {errorPassword ? <Text style={styles.errorText}>{errorPassword}</Text> : null}
              <TextInput
                style={[
                  styles.input,
                  errorConfirmPassword ? { borderColor: 'red' } : null,
                ]}
                placeholderTextColor="#000000"
                backgroundColor="#ffffff"
                borderRadius={5}
                ref={confirmPasswordRef}
                onChangeText={validateConfirmPassword} // Update this line
                value={confirmPassword}
                placeholder="Retype Password"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errorConfirmPassword ? <Text style={styles.errorText}>{errorConfirmPassword}</Text> : null}
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={{ marginRight: 110, marginTop: 10 }}>Select Language:</Text>
                  <TouchableOpacity onPress={onPressHandlerSelectLang} style={styles.selectLangBtn}>
                    <Text>press</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ marginTop: 12 }}>Select Filter:</Text>
              </View>
              <View>
                <Text style={[{marginTop: 30}, { marginBottom: 10 }, { fontWeight: 'bold' }]}>Select an Email Provider if it's on the list:</Text>
                  <TouchableOpacity style={[styles.emailProvider, styles.appleProvider]}>
                    <Text style={[styles.providersTexts, { color: '#000000' }]}>APPLE ICLOUD ACCOUNT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity  style={[styles.emailProvider, styles.googleProvider]}>
                    <Text style={[styles.providersTexts, { color: '#000000' }]}>GOOGLE GMAIL ACCOUNT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity  style={[styles.emailProvider, styles.microsoftOutlookProvider]}>
                    <Text style={[styles.providersTexts, { color: '#000000' }]}>MICROSOFT OUTLOOK ACCOUNT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.emailProvider, styles.yahooProvider]}>
                    <Text style={[styles.providersTexts, { color: '#ffffff' }]}>YAHOO ACCOUNT</Text>
                  </TouchableOpacity>
                </View>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.pressableWelcome,
                styles.pressableBackground,
                pressed && styles.pressableBackgroundHovered,
              ]}
              onPress={onPressHandler}
            >
              <Text style={styles.textPressable}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  
