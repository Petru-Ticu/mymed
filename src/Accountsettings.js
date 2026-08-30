import React, { useState, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AppScreen from './layout/AppScreen';
import { useAppNavigation } from './navigation/useAppNavigation';
import { styles } from './Accountsettings.styles';
import { accountStore, userAppState } from './userStore';

export default function Accountsettings() {
  const { windowWidth } = useAppNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [typePasswordChange, setTypePasswordChange] = useState('');
  const [typePasswordError, setTypePasswordError] = useState(''); // Error state for the password field
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [retypeYourNewPassword, setRetypeYourNewPassword] = useState('');

  // hoover states for when the user hoover over one of these fields
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [retypePasswordFocused, setRetypePasswordFocused] = useState(false);

  const userInfo = useRef({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    userPassword: '',
  });

  const handleSaveAccountInfos = () => {
    const birthDateText = `${birthDate.day}/${birthDate.month}/${birthDate.year}`;
    userInfo.current = {
      firstName,
      lastName,
      gender,
      birthDate: birthDateText,
      userPassword: retypeYourNewPassword,
    };
    accountStore.save({
      firstName,
      lastName,
      gender,
      birthDate: birthDateText,
      passwordTyped: retypeYourNewPassword,
    });
    console.log('<------------------------ Accountsettings.js - saved user data class - ----------------------------->')
    console.log('User Info Saved:', userInfo.current); // For debugging purposes
    console.log('<------------------------ Accountsettings.js - saved user data class - ----------------------------->')
    userAppState.debugLog();
  };


  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [birthDateModalVisible, setBirthDateModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const genderInputRef = useRef(null);
  const [genderButtonSize, setGenderButtonSize] = useState({ width: 40, height: 40 });

  const birthDateInputRef = useRef(null);
  const [birthDateButtonSize, setBirthDateButtonSize] = useState({ width: 40, height: 40 });

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString()); //variable list used to show the days of a month in the birth date modal

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString()); //variable list used to hsow the months of a year in the birth date modal

  const currentYear = new Date().getFullYear(); //variable to get the latest year that we are in and to be in the year list of the birth date modal
  const years = Array.from({ length: currentYear - 1900 }, (_, i) => (currentYear - i).toString()); //variable list used to show the years in the birth date modal



  const CHARACTER_FIRST_LAST_NAME_LIMIT = 36; //limit of characters for the fields


  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const typePasswordRef = useRef(null);
  const changePasswordRef = useRef(null);
  const retypeNewPasswordRef = useRef(null);

const blurAllInputs = () => {
  if (firstNameRef.current) firstNameRef.current.blur();
  if (lastNameRef.current) lastNameRef.current.blur();
  if (typePasswordRef.current) typePasswordRef.current.blur();
  if (changePasswordRef.current) changePasswordRef.current.blur();
  if (retypeNewPasswordRef.current) retypeNewPasswordRef.current.blur();
};

  

  const handleTextChange = (setter, ref) => (text) => {
    const regex = /^[a-zA-Z\s]*$/;
    if (regex.test(text) && text.length <= CHARACTER_FIRST_LAST_NAME_LIMIT) {
      setter(text);
      if (ref.current) {
        const cursorPosition = text.length;
        setTimeout(() => {
          ref.current.setNativeProps({
            text: text,
            selection: { start: cursorPosition, end: cursorPosition }
          });
        }, 10); // Adjusting the timeout duration as needed
      }
    }
  };

  
  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setGenderModalVisible(false);
  };

  


  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>[\]_\-=+`~\/\\§± ]/.test(password);
    return hasUpperCase && hasSymbol;
  };

  const handlePasswordChange = (text) => {
    setTypePasswordChange(text);
    if (text.length > 0 && !validatePassword(text)) {
      setTypePasswordError("This is not the right password!");
    } else {
      setTypePasswordError('');
    }
  };
  

   const handleBirthDateConfirm = () => {
    setBirthDate({
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
    });
    setBirthDateModalVisible(false);
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior="padding" style={styles.body}>
      <ScrollView contentContainerStyle={[styles.bodyContent, {  justifyContent: 'flex-start', width: windowWidth }]} 
      horizontal={false} 
      showsHorizontalScrollIndicator={false} 
      showsVerticalScrollIndicator={false}
      >
        <View style={styles.accountPanels}>
          <Text style={styles.text}>First Name:</Text>
          <TextInput style={[styles.accountInputs, { width: 320, borderColor: firstNameFocused ? '#32CD32' : '#000000' }]} value={firstName}
              onChangeText={handleTextChange(setFirstName, firstNameRef)}
              mode="outlined"
              placeholder="Enter your first name"
              maxLength={CHARACTER_FIRST_LAST_NAME_LIMIT}
              autoCorrect={false}
              autoCapitalize='none'
              ref={firstNameRef}
              theme={{
                colors: {
                  primary: firstNameFocused ? '#32CD32' : undefined,
                  text: '#000000',
                  placeholder: '#000000'
                }
              }}
              onFocus={() => setFirstNameFocused(true)}
              onBlur={() => setFirstNameFocused(false)}
              outlineColor={firstNameFocused ? '#32CD32' : '#000000'}
              fontSize={36}
              letterSpacing={1}>
              </TextInput>
        </View>
        <View style={styles.accountPanels}>
          <Text style={styles.text}>Last Name:</Text>
          <TextInput style={[styles.accountInputs, {width: 320, borderColor: lastNameFocused ? '#32CD32' : '#000000' }]}  value={lastName}
              onChangeText={handleTextChange(setLastName, lastNameRef)}
              mode="outlined"
              placeholder="Enter your last name"
              maxLength={CHARACTER_FIRST_LAST_NAME_LIMIT}
              autoCorrect={false}
              autoCapitalize='none'
              ref={lastNameRef}
              theme={{
                colors: {
                  primary: lastNameFocused ? '#32CD32' : undefined,
                  text: '#000000',
                  placeholder: '#000000'
                }
              }}
              onFocus={() => setLastNameFocused(true)}
              onBlur={() => setLastNameFocused(false)}
              outlineColor={lastNameFocused ? '#32CD32' : '#000000'}>
          </TextInput>
        </View>
        <View style={styles.accountPanels}>
          <Text style={styles.text}>Gender:</Text>
          <View style={styles.genderPanelOrdering}>
          <TextInput style={[styles.accountInputs, styles.centeredText, { width: 172.5 }]} value={gender}
              mode="outlined"
              placeholder="Enter your gender"
              editable={false}
              ref={genderInputRef}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setGenderButtonSize({ width: height, height });
              }}
              outlineColor='#000000'>
          </TextInput>
          
          <TouchableOpacity 
                style={[styles.genderButton, { width: genderButtonSize.width, height: genderButtonSize.height } ]}
                onPress={() => {
                  blurAllInputs();
                  setGenderModalVisible(true)
                }}
              >
                <Text style={styles.arrow}>▲</Text>
          </TouchableOpacity>
          </View>
        </View>
        <View style={styles.accountPanels}>
          <Text style={styles.text}>Birth Date:</Text>
          <View style={styles.genderPanelOrdering}>
          <TextInput style={[styles.accountInputs, styles.centeredText, { width: 172.5 }]} 
              mode="outlined"
              placeholder="ex: 20/08/1990"
              value={birthDate.day && birthDate.month && birthDate.year ? `${birthDate.day}/${birthDate.month}/${birthDate.year}` : ''}
              editable={false}
              ref={birthDateInputRef}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setBirthDateButtonSize({ width: height, height });
              }}
              outlineColor='#000000'>
          </TextInput>
          <TouchableOpacity 
                style={[styles.birthDateButton, { width: birthDateButtonSize.width, height: birthDateButtonSize.height } ]}
                onPress={() => {
                  blurAllInputs();
                  setBirthDateModalVisible(true)
                }}
              >
                <Text style={styles.arrow}>▲</Text>
          </TouchableOpacity>
        </View>
        </View>
        <View style={styles.accountPanels}>
          <Text style={styles.text}>Type your password if you want to {"\n"} Change It:</Text>
          <TextInput style={[styles.accountInputs, {width: 320}]} value={typePasswordChange}
              onChangeText={handlePasswordChange}
              mode="outlined"
              placeholder="Enter your password here"
              maxLength={CHARACTER_FIRST_LAST_NAME_LIMIT}
              autoCorrect={false}
              autoCapitalize='none'
              secureTextEntry={true}
              ref={typePasswordRef}
              theme={{
                colors: {
                  primary: passwordFocused ? '#32CD32' : undefined,
                  text: '#000000',
                  placeholder: '#000000'
                }
              }}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              outlineColor={passwordFocused ? '#32CD32' : '#000000'}>
          </TextInput>
          {typePasswordError ? <Text style={styles.errorText}>{typePasswordError}</Text> : null}
        </View>
        <View style={styles.accountPanels}>
          <Text style={styles.text}>Change your new password here:</Text>
          <TextInput style={[styles.accountInputs, { width: 320 }]} value={changeNewPassword}
              onChangeText={setChangeNewPassword}
              mode="outlined"
              placeholder="Enter your new password here"
              maxLength={CHARACTER_FIRST_LAST_NAME_LIMIT}
              autoCorrect={false}
              autoCapitalize='none'
              secureTextEntry={true}
              ref={changePasswordRef}
              theme={{
                colors: {
                  primary: newPasswordFocused ? '#32CD32' : undefined,
                  text: '#000000',
                  placeholder: '#000000'
                }
              }}
              onFocus={() => setNewPasswordFocused(true)}
              onBlur={() => setNewPasswordFocused(false)}
              outlineColor={newPasswordFocused ? '#32CD32' : '#000000'}>
          </TextInput>
        </View>
        <View style={styles.accountPanels}>
          <Text style={styles.text}>Retype your new password:</Text>
          <TextInput style={[styles.accountInputs, { width: 320 }]} value={retypeYourNewPassword}
              onChangeText={setRetypeYourNewPassword}
              mode="outlined"
              placeholder="Enter your birth date"
              maxLength={CHARACTER_FIRST_LAST_NAME_LIMIT}
              autoCorrect={false}
              autoCapitalize='none'
              secureTextEntry={true}
              ref={retypeNewPasswordRef}
              theme={{
                colors: {
                  primary: retypePasswordFocused ? '#32CD32' : undefined,
                  text: '#000000',
                  placeholder: '#000000'
                }
              }}
              onFocus={() => setRetypePasswordFocused(true)}
              onBlur={() => setRetypePasswordFocused(false)}
              outlineColor={retypePasswordFocused ? '#32CD32' : '#000000'}>
          </TextInput>
        </View>
        <View style={styles.accountPanels}>
  <TouchableOpacity style={[styles.saveButton, { 
        marginLeft: (windowWidth - 315) / 2, 
        marginRight: (windowWidth - 315) / 2 
      }]} onPress={handleSaveAccountInfos}>
    <Text style={styles.saveButtonText}>Save Account Infos</Text>
  </TouchableOpacity>
</View>


        <View style={[{marginBottom: 180}]} />    
      
        </ScrollView>
      </KeyboardAvoidingView>

<Modal
        transparent={true}
        visible={genderModalVisible}
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContentGender}>
                <Text style={styles.modalTitle}>What is your Gender?</Text>
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => handleGenderSelect('Male')}
                  >
                    <Text style={styles.modalButtonText}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => handleGenderSelect('Female')}
                  >
                    <Text style={styles.modalButtonText}>Female</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => handleGenderSelect('Other')}
                  >
                    <Text style={styles.modalButtonText}>Other</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      

<Modal
        transparent={true}
        visible={birthDateModalVisible}
        animationType="slide"
        onRequestClose={() => setBirthDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBirthDate}>
            <Text style={styles.modalTitle}>What is your birth date?</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDay}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
              >
                {days.map(day => (
                  <Picker.Item key={day} label={day} value={day} />
                ))}
              </Picker>

              <Picker
                selectedValue={selectedMonth}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              >
                {months.map(month => (
                  <Picker.Item key={month} label={month} value={month} />
                ))}
              </Picker>

              <Picker
                selectedValue={selectedYear}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedYear(itemValue)}
              >
                {years.map(year => (
                  <Picker.Item key={year} label={year} value={year} />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity style={styles.modalButtonBirthDate} onPress={handleBirthDateConfirm}>
              <Text style={styles.modalButtonTextBirthDate}>Confirm Birth Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </AppScreen>
  );
}
