import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { ERRORS_DAILY_X_TIMES_A_DAY, ERROR_MESSAGES_MODS_REMS } from './constants';
import { sanitizeDoseCount } from './utils/doseCountInput';
import { inventoryValue } from './utils/frequencyParse';
import { isValidHour, isValidMinute, sortTimesList } from './utils/inputRules';
import FieldError from './FieldError';
import { useI18n } from './i18n';
import FrequencyModalLayout from './FrequencyModalLayout';
import { styles } from './DailyXTimesADayModal.styles';
import ModalsReminders from './ModalsReminders';
import { saveFrequencyDraft, getFrequencyDraft,
  saveFrequencyDone, getFrequencyDone } from './frequencyDraft';


  



export default function DailyXTimesADayModal({
  dailyModalVisible, setDailyModalVisible, handleResetSelectedFrequency, inputValueTimesPerDayDXTAD, timesAndMedsRenderedList, handleMaxDailyDoseChange, handleTimesAndMedsRenderedList,
  handleDailyXTimesADayChanges, setDailyXTimesADayDetails, handleDonePress,
  initialDailyDraft
}) {
  const { t } = useI18n();

  const modalNameDailyXTimesADay = "Daily X Times a Day";
  const [inputTimesValuesError, setInputTimesValuesError] = useState('');
  const [amountDXTAD, setAmountDXTAD] = useState('');
  const [thresholdDXTAD, setThresholdDXTAD] = useState('');
  const [isSelectedDXTAD, setIsSelectedDXTAD] = useState(false);
  const modalsRemindersRef = useRef();

  const MAX_INPUTS = 99;
  const [focusedInput, setFocusedInput] = useState(null); 
  const timeInputRefs = useRef([]);
  const defaultTimes = Array(MAX_INPUTS).fill().map(() => ({ 
    id: uuidv4(),
    hour: '', 
    minute: '',
    medsNum: ''
  }));
  const [timeInputs, setTimeInputs] = useState(defaultTimes);
  const [duplicateTimeValuesError, setDuplicateTimeValuesError] = useState(false);
  const [totalMedsIntake, setTotalMedsIntake] = useState(0);
  const [exceeds99, setExceeds99] = useState(false);
  const [emptyTimeError, setEmptyTimeError] = useState(false);
  const [emptyMedsError, setEmptyMedsError] = useState(false);
  const [donePressed, setDonePressed] = useState(false);
  const [lastDoneCount, setLastDoneCount] = useState(0);

  useEffect(() => {
    if (!dailyModalVisible) {
      return;
    }
    const times = initialDailyDraft?.timesAndMedsRenderedList;
    if (Array.isArray(times) && times.length) {
      setTimeInputs((prev) => {
        const next = [...prev];
        times.forEach((item, index) => {
          const [hour = '', minute = ''] = String(item.time || '').split(':');
          next[index] = {
            ...next[index],
            hour,
            minute,
            medsNum: item.meds != null ? String(item.meds) : '',
          };
        });
        return next;
      });
    }
    const amount = inventoryValue(initialDailyDraft?.amountDXTAD);
    const threshold = inventoryValue(initialDailyDraft?.thresholdDXTAD);
    if (amount) {
      setAmountDXTAD(amount);
    }
    if (threshold) {
      setThresholdDXTAD(threshold);
    }
    if (amount || threshold) {
      setIsSelectedDXTAD(true);
    }
  }, [dailyModalVisible]);
  

  


  const handleInputTimesPerDay = useCallback((text) => {
    const { next, blocked, invalid } = sanitizeDoseCount(text);
    if (blocked) {
      return;
    }
    handleMaxDailyDoseChange(next);
    if (invalid) {
      setInputTimesValuesError(ERRORS_DAILY_X_TIMES_A_DAY.validMedicineIntake);
      return;
    }
    setInputTimesValuesError('');
    updateAndSortTimes(Number(next));
}, [updateAndSortTimes]);


  //HERE IT ENDS THE #1 SECTION!
  
  // Function to get the current time for the placeholders
  const getCurrentTimePlaceholders = () => {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return { hour, minute };
  };

  // Get current time placeholders
  const { hour: currentHour, minute: currentMinute } = getCurrentTimePlaceholders();

  //#1 HERE IT IS THE FUNCTION FOR THE TEXTINPUT WHERE THE USER TYPES
  //THE NUMBER FOR HOW MANY TIMES A IS HIS/HER MEDICINE

  

const handlePillsNumberChange = useCallback((index, text) => {
  const { next, blocked, invalid } = sanitizeDoseCount(text);
  if (blocked || invalid) {
    return;
  }
  setTimeInputs(prev => {
    const newInputs = [...prev];
    newInputs[index].medsNum = next;
    console.log(`Updated medsNum for index ${index}: ${next}`);
    return newInputs;
  });
}, []);

  //HERE IT ENDS THE #1 SECTION!

  //#2 HERE IS IS THE THE FUNCTIONS FOR THE HOUR AND MINUTE THAT APPEAR WHEN THE USER TYPES A 
  //VALUE IN THE IN THE INTAKE FIELD #1


const handleTimeChange = useCallback((index, type, value) => {
  const numericValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  const isValueEmpty = value === "";
  const isValidValue = (type === "hour" && (isValidHour(numericValue) || isValueEmpty)) || 
                       (type === "minute" && (isValidMinute(numericValue) || isValueEmpty));
  
  if (isValidValue) {
      setTimeInputs(prev => {
          const newInputs = [...prev];
          newInputs[index][type] = numericValue;
          console.log(`Updated ${type} for index ${index}: ${numericValue}`);
          return newInputs;
      });
  }
}, []);


const updateAndSortTimes = useCallback((count) => {
  setTimeInputs(prevInputs => {
    // Only take the number of inputs as specified by count for sorting
    const inputsToSort = prevInputs.slice(0, count);
    const sortedTimes = sortTimesList(inputsToSort);

    // Append the unsorted inputs back to the sorted array
    const newTimeInputs = [...sortedTimes, ...prevInputs.slice(count)];
    
    // Log for debugging purposes
    //console.log('Updated and sorted times:', newTimeInputs.map(input => `${input.hour}:${input.minute}`).join(', '));
    
    return newTimeInputs;
  });
}, []);



const handleBlur = useCallback((index, type) => {
  setFocusedInput(null);
  if (type === 'hour' || type === 'minute') {
      // Update the value to have leading zeros
      const updatedValue = timeInputs[index][type].padStart(2, '0');
      handleTimeChange(index, type, updatedValue);

      // Update and sort times only if more than one input is supposed to be visible
      if (inputValueTimesPerDayDXTAD && Number(inputValueTimesPerDayDXTAD) > 1) {
        updateAndSortTimes();
      }
  }
}, [timeInputs, inputValueTimesPerDayDXTAD, updateAndSortTimes]);

const isDuplicateTime = (hour, minute, visibleCount) => {
  const visibleTimes = timeInputs.slice(0, visibleCount);
  const duplicates = visibleTimes.filter(
    time => time.hour === hour && time.minute === minute
  );
  return duplicates.length > 1;
};




useEffect(() => {
  if (inputValueTimesPerDayDXTAD && Number(inputValueTimesPerDayDXTAD) > 0) {
    const visibleCount = Number(inputValueTimesPerDayDXTAD);
    const hasDuplicates = timeInputs.some((time, index) => 
      index < visibleCount &&
      time.hour && 
      time.minute && 
      isDuplicateTime(time.hour, time.minute, visibleCount)
    );
    setDuplicateTimeValuesError(hasDuplicates);
  } else {
    setDuplicateTimeValuesError(false);
  }
}, [timeInputs, inputValueTimesPerDayDXTAD]);

useEffect(() => {
  // Calculate the sum of visible medsNum fields
  const visibleFieldsCount = parseInt(inputValueTimesPerDayDXTAD, 10) || 0;
  const totalIntake = timeInputs.slice(0, visibleFieldsCount).reduce((acc, curr) => {
    const medsNum = parseInt(curr.medsNum, 10) || 0;
    return acc + medsNum;
  }, 0);

  setTotalMedsIntake(totalIntake);
  // Set exceeds99 to true only if the total intake of visible fields exceeds 99
  setExceeds99(totalIntake > 99);
}, [timeInputs, inputValueTimesPerDayDXTAD]); // Depend on inputValueTimesPerDay as well


const errorMessageExceedsNineNine = exceeds99 ? ERRORS_DAILY_X_TIMES_A_DAY.exelOfNineNineBoxes : '';


// Check for empty times after modifications to relevant dat

useEffect(() => {
  const checkErrors = () => {
    const anyEmptyTime = timeInputs.some((input, index) => 
      (input.hour === '' || input.minute === '') && index < lastDoneCount);
    const anyEmptyMeds = timeInputs.some((input, index) => 
      input.medsNum === '' && index < lastDoneCount);

    setEmptyTimeError(anyEmptyTime);
    setEmptyMedsError(anyEmptyMeds);

    if (!anyEmptyTime && !anyEmptyMeds) {
      setDonePressed(false);  // Reset donePressed to allow future checks
    }
  };

  if (donePressed) {
    checkErrors();
  }
}, [timeInputs, donePressed, lastDoneCount]);



// Reset error flags when the number of inputs changes


useEffect(() => {
  if (inputValueTimesPerDayDXTAD === "" || parseInt(inputValueTimesPerDayDXTAD, 10) === 0) {
    setLastDoneCount(0);  // Reset last done count when input is cleared
    if (!donePressed) {
      setEmptyTimeError(false);
      setEmptyMedsError(false);
    }
  }
}, [inputValueTimesPerDayDXTAD]);



const handleBackPressDailyXTimesADay = useCallback(() => {
    const { id, data } = getFrequencyDraft();
    const lastConfirmedDoneBtnModal = getFrequencyDone();
  
  // Only reset if there's no meaningful data set by any modal.
  if (lastConfirmedDoneBtnModal === undefined && (id === undefined || data === undefined)) {
      handleResetSelectedFrequency();
  } else if (lastConfirmedDoneBtnModal && (id || data)) {

  }

  setDailyModalVisible(false);
}, [setDailyModalVisible, handleResetSelectedFrequency]);




const onDonePressDailyXTimesADay = () => {
  setDonePressed(true);
  const currentCount = Number(inputValueTimesPerDayDXTAD);

  if (currentCount === 0) {
    console.error("No times per day input specified.");
    return;
  }

  const formattedTimesList = timeInputs.slice(0, currentCount).map((input, index) => ({
    position: index + 1,
    time: `${input.hour.padStart(2, '0')}:${input.minute.padStart(2, '0')}`,
    meds: input.medsNum
  }));
  const hasEmptyFields = timeInputs.slice(0, currentCount).some(input => input.hour === '' || input.minute === '');

  if (hasEmptyFields) {
      setEmptyTimeError(true);
      console.error("Some time fields are incomplete.");
      return; // Prevent closing the modal if there are incomplete fields
  }

  // Check for empty meds fields
  const hasEmptyMedsFields = timeInputs.slice(0, currentCount).some(input => input.medsNum === '');

  if (hasEmptyMedsFields) {
      setEmptyMedsError(true);
      console.error("Some meds fields are incomplete.");
      return; // Prevent closing the modal if there are incomplete fields
  }

  if (!inputValueTimesPerDayDXTAD) {
    if (!inputValueTimesPerDayDXTAD) {
      setInputTimesValuesError(ERRORS_DAILY_X_TIMES_A_DAY.validMedicineIntake)
      //return;
    }
    return;
  }
  



if (duplicateTimeValuesError || exceeds99 || (modalsRemindersRef.current && modalsRemindersRef.current.areThereValidationErrors())) {
  if (duplicateTimeValuesError) {
      setDuplicateTimeValuesError(ERRORS_DAILY_X_TIMES_A_DAY.duplicateTimeValues);
  }
  if (exceeds99) {
      setExceeds99(ERRORS_DAILY_X_TIMES_A_DAY.exelOfNineNineBoxes);
  }
  return;  // Return to stop the modal from closing
}

// Format the times and meds into structured objects as described
// const timesAndMedsRenderedList = timeInputs.slice(0, currentCount)
// .map((time, index) => ({
//     position: index + 1,
//     time: `${time.hour.padStart(2, '0')}:${time.minute.padStart(2, '0')}`,
//     meds: time.medsNum
// }));
    
  const dailyXTimesADayClass = (() => {

    const now = new Date();

  return {
    modalName: modalNameDailyXTimesADay,
    timeCreatedDXTAD: {
      date: now.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
      }),
      time: now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
      }) + '.' + now.getMilliseconds().toString().padStart(3, '0')
  },
      numberOfHowManyTAD: inputValueTimesPerDayDXTAD,
      timesAndMedsRenderedList: formattedTimesList,
      amountDXTAD: isSelectedDXTAD ? amountDXTAD : "Null",
      thresholdDXTAD: isSelectedDXTAD ? thresholdDXTAD : "Null",
  };
})();

if (!formattedTimesList.every(t => t.time !== "" && t.meds !== "")) {
  console.error("Incomplete time or meds entries.");
  return; // Validate entries before sending up
}

  saveFrequencyDraft('dailyXTimesADay', dailyXTimesADayClass);
  saveFrequencyDone('dailyXTimesADay');
  handleTimesAndMedsRenderedList(formattedTimesList);
  handleDonePress(dailyXTimesADayClass);
  handleDailyXTimesADayChanges(dailyXTimesADayClass);
  setDailyXTimesADayDetails(dailyXTimesADayClass);

  

    setDailyModalVisible(false);


   //console.log(dailyXTimesADayClass);
   console.log("console log for the dailyXTimesADay from the DailyXTimesADay.js file\n this is the dailyXTimesADayClass right now:\n", dailyXTimesADayClass, 
        "\n<-------------------------------------------------------------------------------------------------------------->\n"
        );
};
  





//HERE IT ENDS THE #2 SECTION!

  return (
    <Modal 
      visible={dailyModalVisible}
      transparent
      onRequestClose={handleBackPressDailyXTimesADay}
    >
      <FrequencyModalLayout
        title={t('meds.necessaryQuestions')}
        onBackPress={handleBackPressDailyXTimesADay}
        onDonePress={onDonePressDailyXTimesADay} // You might need to adjust this to fit your logic
      >
            <Text 
              style={styles.modalQuestion}
            >
              {t('meds.timesPerDay')}
            </Text>
            <TextInput 
              style={[styles.inputIntakeVal, {borderColor: inputTimesValuesError ? 'red' : "#000000", borderWidth: inputTimesValuesError ? 2 : 1}]}
              keyboardType="number-pad"
              maxLength={2}
              value={inputValueTimesPerDayDXTAD} 
              onChangeText={handleInputTimesPerDay}
            />

          <View style={styles.errorContainerDeletedTimeValuesIntakeDailyXTAD}>
          {inputTimesValuesError ? <FieldError message={inputTimesValuesError} /> : null}
          </View>
          <View style={styles.errorContainerTimeValuesIntakeDailyXTAD}>
            {duplicateTimeValuesError ? <FieldError message={ERRORS_DAILY_X_TIMES_A_DAY.duplicateTimeValues} /> : null}
          </View>
          <View style={styles.errorContainerMedsNumberSum}>
            {exceeds99 ? <FieldError message={errorMessageExceedsNineNine} vars={{ count: totalMedsIntake }} /> : null}
          </View>
          <View style={styles.errorContainerHourAndMinute}>
          {emptyTimeError ? <FieldError message={ERRORS_DAILY_X_TIMES_A_DAY.timeValuesAreEmpty} /> : null}
          </View>
          <View style={styles.errorContainerMeds}>
          {emptyMedsError ? <FieldError message={ERRORS_DAILY_X_TIMES_A_DAY.medsValuesAreEmpty} /> : null}
          </View>

          {timeInputs.slice(0, Number(inputValueTimesPerDayDXTAD) || 0).map((time, index, array) => (
            <React.Fragment key={index}>
           <View 
            style={styles.timeInputContainer}
            ref={(el) => { timeInputRefs.current[index] = el; }}
          >
            <View style={styles.timeInputGroup}>
              <TextInput 
                style={[styles.inputTimes,
                   { borderBottomColor:
                     focusedInput === `hour-${index}` ? "#D1FFD1" :
                     isDuplicateTime(time.hour, time.minute, Number(inputValueTimesPerDayDXTAD)) ? 'red' : "#000000",
                     color: isDuplicateTime(time.hour, time.minute, Number(inputValueTimesPerDayDXTAD)) ? 'red' : "#000000" }]}
                keyboardType="number-pad"
                maxLength={2}
                value={time.hour}
                placeholder={currentHour}
                placeholderTextColor={(emptyTimeError && !time.hour) ? 'red' : '#666666'}
                onChangeText={text => handleTimeChange(index, 'hour', text)}
                onFocus={() => setFocusedInput(`hour-${index}`)}
                onBlur={() => handleBlur(index, 'hour', time.hour)}
              />
              <Text style={styles.colon}>:</Text>
              <TextInput 
                style={[styles.inputTimes,
                   { borderBottomColor:
                     focusedInput === `minute-${index}` ? "#D1FFD1" :
                     isDuplicateTime(time.hour, time.minute, Number(inputValueTimesPerDayDXTAD)) ? 'red' : "#000000",
                     color: isDuplicateTime(time.hour, time.minute, Number(inputValueTimesPerDayDXTAD)) ? 'red' : "#000000" }]}
                keyboardType="number-pad"
                maxLength={2}
                value={time.minute}
                placeholder={currentMinute}
                placeholderTextColor={(emptyTimeError && !time.minute) ? 'red' : '#666666'}
                onChangeText={text => handleTimeChange(index, 'minute', text)}
                onFocus={() => setFocusedInput(`minute-${index}`)}
                onBlur={() => handleBlur(index, 'minute', time.minute)}
              />
              </View>
              <TextInput 
                style={[styles.inputMedsNum, { marginLeft: 182 },
                exceeds99 ? {borderColor: 'red', color: 'red'} : {},
                (emptyMedsError && !time.medsNum) ? {borderColor: 'red'} : {}]}
                keyboardType="number-pad"
                maxLength={2}
                value={time.medsNum}
                placeholder="1"
                placeholderTextColor={(emptyMedsError && !time.medsNum) ? 'red' : 'rgba(102, 102, 102, 0.5)'}
                onChangeText={text => handlePillsNumberChange(index, text)}
              />
          </View>
                {index !== array.length - 1 && 
                <View style={styles.separator} />
                }
            </React.Fragment>
          ))}
          <View style={{ marginBottom: 35 }}></View>

          <View style={styles.errorContainerHourAndMinuteBottom}>
          {emptyTimeError ? <FieldError message={ERRORS_DAILY_X_TIMES_A_DAY.timeValuesAreEmpty} /> : null}
          </View>
          <View style={styles.errorContainerMedsBottom}>
          {emptyMedsError ? <FieldError message={ERRORS_DAILY_X_TIMES_A_DAY.medsValuesAreEmpty} /> : null}
          </View>

          <ModalsReminders 
            activeModal="dailyXTimesADay"
            onAmountChangeDXTAD={setAmountDXTAD}
            onThresholdChangeDXTAD={setThresholdDXTAD}
            amountDXTAD={amountDXTAD}
            totalMedsIntake={totalMedsIntake}
            thresholdDXTAD={thresholdDXTAD}
            ERRORS_DAILY_X_TIMES_A_DAY={ERRORS_DAILY_X_TIMES_A_DAY}
            ERROR_MESSAGES_MODS_REMS={ERROR_MESSAGES_MODS_REMS}
            isSelectedDXTAD={isSelectedDXTAD}
            setIsSelectedDXTAD={setIsSelectedDXTAD}
            inputValueTimesPerDayDXTAD={inputValueTimesPerDayDXTAD}
            setInputTimesValuesError={setInputTimesValuesError}
            ref={modalsRemindersRef}
          />
    </FrequencyModalLayout>
    </Modal>
  );
}
