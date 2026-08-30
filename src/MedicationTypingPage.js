import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarPicker from 'react-native-calendar-picker';
import AsNeededModal from './AsNeededModal';
import DailyXTimesADayModal from './DailyXTimesADayModal';
import DailyEveryXHoursModal from './DailyEveryXHoursModal';
import { saveFrequencyDraft, saveFrequencyDone,
  getFrequencyDraft, getFrequencyDone, resetFrequencyDraft } from './frequencyDraft';
import { useMedicalList } from './MedicalListContext';
import { parseFrequencyText, parseStoredDate } from './utils/frequencyParse';
import { MEDICATION_UNITS, MEDICATION_FREQUENCIES } from './constants';
import { styles } from './MedicationTypingPage.styles';

let lastMedicalListId = 0;

function buildMedicalListEntry(productName, unit, modalFrequency, importantInfo, startAndEndDatesClass) {
  const now = new Date();
  return {
    id: ++lastMedicalListId,
    createdOn: now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
    createdAt: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0'),
    productName,
    unit,
    modalFrequency,
    importantInfo,
    startAndEndDatesClass,
  };
}

export default function MedicationTypingPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isEditMode = route.params?.mode === 'edit';
  const editIndex = route.params?.listIndex;
  const listBeingEdited = route.params?.list;
  const [unitsModalVisible, setUnitsModalVisible] = useState(false); //units modal visible state variable
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false); //frequency modal visible state variable
  const [selectedFrequency, setSelectedFrequency] = useState('Frequency of Meds e.g. day/hour etc');
  //The start date and end date variables.
  const [calendarVisible, setCalendarVisible] = useState(false); //for closing and opening the calendar modal state variable
  const [startDate, setStartDate] = useState(null); //for updating the starging date state variable
  const [endDate, setEndDate] = useState(null); //for updating the end date state variable
  const [startAndEndDatesClass, setStartAndEndDatesClass] = useState(null);
  //Frequency modal variables
  const [asNeededModalVisible, setAsNeededModalVisible] = useState(false);
  const [dailyXTimesModalVisible, setDailyXTimesModalVisible] = useState(false);
  const [dailyEveryXHoursModalVisible, setDailyEveryXHoursModalVisible] = useState(false);
  const [maxDailyDoseAsNeeded, setMaxDailyDoseAsNeeded] = useState(null);
  const [inputValueTimesPerDayDXTAD, setInputValueTimesPerDayDXTAD] = useState(null);
  const [timesAndMedsRenderedList, setTimesAndMedsRenderedList] = useState([]);
  const [currentFrequencyDetails, setCurrentFrequencyDetails] = useState(null);
  const [smallText, setSmallText] = useState(false);

  //MedicationTypingPage Class
  const [modalName, setModalName] = useState(''); 
  const [productName, setProductName] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState(''); //selecting mesarurement state variable
  const [importantInfo, setImportantInfo] = useState('');

  const { setMedicalLists, medicalLists } = useMedicalList();

  //navigation funciton to go back
  const handleGoBack = () => {
    navigation.goBack();
    console.log('Before updating in MedicationTypingPage:', getFrequencyDraft())
   //saveFrequencyDraft(null);
   resetFrequencyDraft();
    console.log('After updating in MedicationTypingPage:', getFrequencyDraft())
  };

  //selecting measurement from the units list function
  const handleMeasurementPress = (measurement) => {
    setSelectedMeasurement(measurement);
    setUnitsModalVisible(false);
  };

  //selecting one of the frequencies from the list
  //and logic for each one 
  //into the function 
  const handleFrequencyPress = (frequency) => {
    switch (frequency) {
        case "As needed (PRN)":
            if (currentFrequencyDetails?.maxNumPills) {
              setMaxDailyDoseAsNeeded(String(currentFrequencyDetails.maxNumPills));
            } else {
              setMaxDailyDoseAsNeeded(null);
            }
            setAsNeededModalVisible(true);
            break;
        case 'Daily, X times a day':
            if (currentFrequencyDetails?.timesAndMedsRenderedList?.length) {
              setInputValueTimesPerDayDXTAD(String(currentFrequencyDetails.numberOfHowManyTAD || currentFrequencyDetails.timesAndMedsRenderedList.length));
              setTimesAndMedsRenderedList(currentFrequencyDetails.timesAndMedsRenderedList);
            } else {
              setInputValueTimesPerDayDXTAD(null);
              setTimesAndMedsRenderedList([]);
            }
            setDailyXTimesModalVisible(true);
            break;
        case 'Daily, every X hours':
            setDailyEveryXHoursModalVisible(true);
            break;
        // Additional cases as needed
    }
  // Only close the modal; do not set frequency details here
  setFrequencyModalVisible(false);
};


  



  const handleDonePress = (modalClass) => {
    console.log("Received modal class:", JSON.stringify(modalClass), "modal class without JSON.STRINGIFY" ,modalClass);

     // Use getFrequencyDone() to check the current value
const currentDoneBtn = getFrequencyDone();

if (currentDoneBtn === 'dailyXTimesADay') {
  setModalName('Daily, X times a day');
  setCurrentFrequencyDetails(modalClass);
} else if (currentDoneBtn === 'asNeeded') {
  setModalName('As needed (PRN)');
  setCurrentFrequencyDetails(modalClass); 
}
  };

  useEffect(() => {
    console.log("Current timesAndMedsRenderedList:", timesAndMedsRenderedList);
}, [timesAndMedsRenderedList]);

  
  //these functions checks to see if maxDailyDose is a number and also if is typed and 
  //also updates the the values of the modals where it is maxDailyDose (right now it is only used for AsNeededModal and 
  //DailyXTimesADay) and also sets to true user's activity with the maxDailyDose
  const handleMaxDailyDoseChangeAsNeeded = (value) => {
    setMaxDailyDoseAsNeeded(value);
  }

  const handleMaxInputNumberDailyXTimesADay = (value) => {
    setInputValueTimesPerDayDXTAD(value);
  }

  const handleTimesAndMedsRenderedList = (value) => {
    setTimesAndMedsRenderedList(value);
  }

  //this function it is used for closing the 
  //units modal
  const handleUnitsModalClose = () => {
    setUnitsModalVisible(false);
  };

  //this function it is used for closing the
  //frequency modal
  const handleFrequencyModalClose = () => {
    setFrequencyModalVisible(false);
  };

  //this function opens the date modal when
  //the user presses the date button
  const handleDateButtonPress = () => {
    setCalendarVisible(true);
  };

  //manages selection of dates 
  //in the calendar component.
  const handleDateSelect = (date) => {
    if (!startDate) {
      setStartDate(date);
    } else if (!endDate) {
      if (date.isAfter(startDate)) {
        setEndDate(date);
      } else {
        setEndDate(null);
        setStartDate(date);
      }
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  //closes the calendar modal
  const handleConfirmDates = () => {
    setCalendarVisible(false);

    const now = new Date();

    // Create an object to hold the start and end dates
    const newStartAndEndDatesClass = {

      // Recording the current timestamp details
      createdOn: now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      createdAt: now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + '.' + now.getMilliseconds().toString().padStart(3, '0'),

      startDate: startDate ? startDate.format('DD-MM-YYYY') : null,
      startDay: startDate ? startDate.format('dddd') : null,
      endDate: endDate ? endDate.format('DD-MM-YYYY') : null,
      endDay: endDate ? endDate.format('dddd') : null,
    };

    // Optional: Log the date class object to console or handle it further
    console.log("Start and End Dates:", startAndEndDatesClass);
    setStartAndEndDatesClass(newStartAndEndDatesClass);
  };

  //updates the AsNeeded frequency details based
  //on the changes made in the AsNeeded modal by using the Class 
  //from the AsNeeded modal.
  const handleAsNeededChanges = (asNeededClass) => {
    const amountAndThresholdAsNeeded =
      asNeededClass.AmountAsNeeded === null && asNeededClass.ThresholdAsNeeded === null
        ? "Amount: Null; Threshold: Null"
        : `Amount: ${asNeededClass.AmountAsNeeded}; Threshold: ${asNeededClass.ThresholdAsNeeded}`;
  
    const textValueAsNeeded = `Max Number of Meds per day: ${asNeededClass.maxNumPills}; ${amountAndThresholdAsNeeded}`;
  
    setSelectedFrequency(textValueAsNeeded);
    setSmallText(true);
  };

  //updates the dailyXTImesADay frequency details based
  //on the changes made in the dailyXTimesADay modal using the Class
  //from the dailyXTimesADay modal.
  const handleDailyXTimesADayChanges = (dailyXTimesADayClass) => {
  const amountAndThresholdDXTAD =
  dailyXTimesADayClass.amountDXTAD === null && dailyXTimesADayClass.thresholdDXTAD === null
  ? "Amount: Null; Threshold: Null"
  : `Amount: ${dailyXTimesADayClass.amountDXTAD}; Threshold: ${dailyXTimesADayClass.thresholdDXTAD}`;

  const textValueDailyXTimesADay = `Number of how many Times a Day you are taking your Meds: ${dailyXTimesADayClass.numberOfHowManyTAD}; ${amountAndThresholdDXTAD}`;

  setSelectedFrequency(textValueDailyXTimesADay);
  setSmallText(true);
   };
  

  //resets the state variable 'selectedFrequency'
  //to it's initial placeholder text
  const handleResetSelectedFrequency = () => {
    setSelectedFrequency('Frequency of Meds e.g. day/hour etc');
};

  //gets the user out of this file if
  //he put the right information and 
  //didnt' let empty any field and will 
  //also put in the previous file the 
  //informations that the user typed
  //in this file
  useEffect(() => {
    if (!isEditMode || !listBeingEdited) {
      return;
    }

    setProductName(listBeingEdited.productName || '');
    setSelectedMeasurement(listBeingEdited.unit || '');
    setImportantInfo(listBeingEdited.importantInfo || '');
    setStartAndEndDatesClass(listBeingEdited.startAndEndDatesClass || null);
    setStartDate(parseStoredDate(listBeingEdited.startAndEndDatesClass?.startDate));
    setEndDate(parseStoredDate(listBeingEdited.startAndEndDatesClass?.endDate));

    const parsedFrequency = parseFrequencyText(listBeingEdited.modalFrequency);
    setModalName(parsedFrequency.modalName);
    setCurrentFrequencyDetails(parsedFrequency.details);

    if (parsedFrequency.type === 'asNeeded' && parsedFrequency.details) {
      setMaxDailyDoseAsNeeded(parsedFrequency.details.maxNumPills || null);
      handleAsNeededChanges(parsedFrequency.details);
      saveFrequencyDraft('asNeeded', parsedFrequency.details);
      saveFrequencyDone('asNeeded');
    } else if (parsedFrequency.type === 'dailyXTimesADay' && parsedFrequency.details) {
      setInputValueTimesPerDayDXTAD(parsedFrequency.details.numberOfHowManyTAD || null);
      setTimesAndMedsRenderedList(parsedFrequency.details.timesAndMedsRenderedList || []);
      handleDailyXTimesADayChanges(parsedFrequency.details);
      saveFrequencyDraft('dailyXTimesADay', parsedFrequency.details);
      saveFrequencyDone('dailyXTimesADay');
    }
  }, [isEditMode, editIndex, listBeingEdited?.id, listBeingEdited?.modalFrequency]);

  const createMedicalList = () => {
    if (!currentFrequencyDetails) {
        console.error("Frequency details must be set.");
        return; // Stop the function if the frequency details are not available
    }

    let frequencyDescription;

        // Default to stringifying the object
        if (modalName === "As needed (PRN)") {
          // Assuming currentFrequencyDetails is correctly structured
          frequencyDescription = `As Needed (PRN)\n\nCreated at: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}\n\n` +
                                 `Maximum Number of Meds Per Day: ${currentFrequencyDetails.maxNumPills}\n\n` +
                                 `Amount: ${currentFrequencyDetails.AmountAsNeeded}\n\n` +
                                 `Threshold: ${currentFrequencyDetails.ThresholdAsNeeded}\n`;
        } else if (modalName === "Daily, X times a day" && currentFrequencyDetails.timesAndMedsRenderedList) {

          // Format times and medication list
          const timesAndMedsFormatted = currentFrequencyDetails.timesAndMedsRenderedList.map((item, index) => 
          `${index + 1}. ${item.time} - meds: ${item.meds}`
          ).join('\n\n');

          frequencyDescription = `Daily X Times a Day\n\nCreated at: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}\n\n` +
                                 `Number of Times in a Day you are taking the Meds: ${currentFrequencyDetails.numberOfHowManyTAD}\n\n` +
                                 `Times when you are taking the Meds in a Day:\n\n${timesAndMedsFormatted}\n\n` +
                                 `Amount: ${currentFrequencyDetails.amountDXTAD}\n\n` +
                                 `Threshold: ${currentFrequencyDetails.thresholdDXTAD}\n`;
        } else {
          frequencyDescription = JSON.stringify(currentFrequencyDetails, null, 2);
        }

    if (isEditMode && typeof editIndex === 'number') {
      const previousList = medicalLists[editIndex] || listBeingEdited || {};
      const updatedList = {
        ...previousList,
        productName,
        unit: selectedMeasurement,
        modalFrequency: frequencyDescription,
        importantInfo,
        startAndEndDatesClass,
      };
      const nextLists = [...medicalLists];
      nextLists[editIndex] = updatedList;
      setMedicalLists(nextLists);
      resetFrequencyDraft();
      navigation.goBack();
      return;
    }

    const newMedicalList = buildMedicalListEntry(
        productName,
        selectedMeasurement,
        frequencyDescription,
        importantInfo,
        startAndEndDatesClass
    );

    
    setMedicalLists([newMedicalList, ...medicalLists]);
    console.log("Newly Created Medical List Entry:", JSON.stringify(newMedicalList));
    resetFrequencyDraft();
    navigation.goBack();
    // Here, you would typically want to save this `newMedicalList` to state or perform other operations like sending it to a backend server.
};



  //this is the list of units
  const units = MEDICATION_UNITS;
  const frequencies = MEDICATION_FREQUENCIES;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#000000" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{isEditMode ? 'Edit your Medication' : 'Informations about your Medication'}</Text>
          </View>
        </View>
        <ScrollView style={styles.content}>
          <TextInput
            style={styles.inputProductBrand}
            placeholder="Name/Brand of the product"
            placeholderTextColor="#000000"
            keyboardType="default"
            maxLength={35}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            onChangeText={setProductName}
            value={productName}
          />
          <View style={styles.unitContainer}>
            <View style={styles.measurementContainer}>
              <TextInput
                style={styles.measurementInput}
                placeholder="Unit (e.g., mg, ml, ui)"
                placeholderTextColor="#000000"
                value={selectedMeasurement}
                editable={false}
              />
              <TouchableOpacity onPress={() => setUnitsModalVisible(true)} style={styles.measurementButton}>
                <MaterialIcons name="arrow-drop-up" size={26} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.frequencyContainer}>
          <View style={styles.frequencyInput}>
    <Text style={smallText ? styles.smallText : styles.normalText}>
      {selectedFrequency}
    </Text>
  </View>
    <TouchableOpacity onPress={() => setFrequencyModalVisible(true)} style={styles.frequencyButton}>
        <MaterialIcons name="arrow-drop-up" size={26} color="#000000" />
    </TouchableOpacity>
          </View>
        <TextInput
         style={styles.instructionsInput}
         placeholder="Important Information"
         placeholderTextColor="#000000"
         keyboardType="default"
         multiline={true}
         maxLength={200}
         autoCapitalize="none"
         autoCorrect={false}
         autoComplete="off"
         value={importantInfo}
         onChangeText={setImportantInfo}
       />
<View style={styles.dateButtonContainer}>
  {/*here the date function opens the date modal*/}
    <TouchableOpacity onPress={handleDateButtonPress} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>
            {startDate ? `Start Date: ${startDate.format('DD.MM.YYYY')}` : 'Start Date:'}
        </Text>
        <Text style={styles.dateButtonText}>
            {endDate ? `End Date: ${endDate.format('DD.MM.YYYY')}` : 'End Date:'}
        </Text>
    </TouchableOpacity>
</View>
    </ScrollView>
    <View style={styles.medListButtonContainer}>
      <TouchableOpacity style={styles.medListButton} onPress={createMedicalList}>
        <Text style={styles.medListButtonTex}>
            {isEditMode ? 'Save Medical List' : 'Create Medical List'}
        </Text>
      </TouchableOpacity>
    </View>
    {/* start of the unit list code */}
    {/*here is the funtion called to close the units modal two times*/}
    <Modal visible={unitsModalVisible} transparent onRequestClose={handleUnitsModalClose}> 
        <TouchableWithoutFeedback onPress={handleUnitsModalClose}> 
          
            <View style={styles.modalContainer}>
    <ScrollView 
     showsVerticalScrollIndicator={false}
     style={styles.modalContent}
    >
{units.map((unit, index) => (
    <TouchableOpacity
     key={unit}
     onPress={() => handleMeasurementPress(unit)} //where it activates the select mesurement function
     style={[styles.modalItem, index === units.length - 1 && styles.lastModalItem]}
    >
<Text style={styles.modalItemText}>{unit}</Text>
    </TouchableOpacity>
))}
    </ScrollView>
            </View>
            
        </TouchableWithoutFeedback>
        
    </Modal>
    {/* end of the unit list code */}
    {/* start of the frequency list code */}
    <Modal visible={frequencyModalVisible} transparent onRequestClose={handleFrequencyModalClose}> 
        <TouchableWithoutFeedback onPress={handleFrequencyModalClose}>
            <View style={styles.modalContainer}>
                <ScrollView style={styles.modalContent}>
                {frequencies.map((frequency) => (
                    <TouchableOpacity
                    key={frequency}
                    onPress={() => handleFrequencyPress(frequency)}
                    style={styles.modalItem}
                    >
                        <Text style={styles.modalItemText}>{frequency}</Text>
                    </TouchableOpacity>
))}
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
    {/* end of the frequency list code */}
    {/* start of the modals bodies code */}
    <AsNeededModal
      asNeededModalVisible={asNeededModalVisible} //here it contorls if the modals is open or closed 
      setAsNeededModalVisible={setAsNeededModalVisible} //here it gives the actual modal a way of closing it
      handleResetSelectedFrequency={handleResetSelectedFrequency} //here it passes a function to reset the selected frequency state to its default value, allowing the child component to clear the selection.
      handleMaxDailyDoseChange={handleMaxDailyDoseChangeAsNeeded} //here it is called the function used for the maxDailyDose variable
      maxDailyDoseAsNeeded={maxDailyDoseAsNeeded} //here it is called the function from this file for checking to see if the maxDailyDose from asNeeded modal follows the rules of the function.
      handleDonePress={handleDonePress} //here is it called the function that updates the asNeededObject Class.
      handleAsNeededChanges={handleAsNeededChanges} //here it passes a function to update the parent component's selected frequency state based on changes in the AsNeededModal.
      setAsNeededDetails={setCurrentFrequencyDetails}  //{setAsNeededDetails} //here it provides the child component with a function to update 'asNeededDetails' state in the parent component, reflecting changes made in the AsNeededModal.
      initialAmount={currentFrequencyDetails?.AmountAsNeeded ?? currentFrequencyDetails?.amountDXTAD}
      initialThreshold={currentFrequencyDetails?.ThresholdAsNeeded ?? currentFrequencyDetails?.thresholdDXTAD}
    />
    <DailyXTimesADayModal 
      dailyModalVisible={dailyXTimesModalVisible} 
      setDailyModalVisible={setDailyXTimesModalVisible} 
      handleResetSelectedFrequency={handleResetSelectedFrequency}
      handleMaxDailyDoseChange={handleMaxInputNumberDailyXTimesADay}
      handleTimesAndMedsRenderedList={handleTimesAndMedsRenderedList}
      inputValueTimesPerDayDXTAD={inputValueTimesPerDayDXTAD}
      timesAndMedsRenderedList={timesAndMedsRenderedList}
      handleDonePress={handleDonePress}
      handleDailyXTimesADayChanges={handleDailyXTimesADayChanges}
      setDailyXTimesADayDetails={setCurrentFrequencyDetails} //{setDailyXTimesADayDetails}
      initialDailyDraft={{
        numberOfHowManyTAD: currentFrequencyDetails?.numberOfHowManyTAD,
        timesAndMedsRenderedList: currentFrequencyDetails?.timesAndMedsRenderedList || [],
        amountDXTAD: currentFrequencyDetails?.amountDXTAD ?? currentFrequencyDetails?.AmountAsNeeded,
        thresholdDXTAD: currentFrequencyDetails?.thresholdDXTAD ?? currentFrequencyDetails?.ThresholdAsNeeded,
      }}
    />
    <DailyEveryXHoursModal
      visible={dailyEveryXHoursModalVisible}
      onClose={() => setDailyEveryXHoursModalVisible(false)}
      validate={() => true}
    />
    {/* end of the modals bodies code */}
    {/*below there are two closing variables to close the date modal*/}
    <Modal visible={calendarVisible} transparent> 
        {/* <TouchableWithoutFeedback onPress={() => setCalendarVisible(false)}> */}
            <View style={styles.modalContainer}>
                <View style={styles.calendarContainer}>
                    <CalendarPicker
                    startFromMonday={true}
                    allowRangeSelection={true}
                    minDate={isEditMode ? undefined : new Date()} //Prevents selecting past dates on create
                    onDateChange={handleDateSelect} 
                    selectedStartDate={startDate ? startDate.toDate() : null}
                    selectedEndDate={endDate ? endDate.toDate() : null}
                    selectedDayColor="#D1FFD1"
                    selectedDayTextColor="#000000"
                    textStyle={styles.calendarText}
                    previousTitle="<"
                    nextTitle=">"
                    />
                        <TouchableOpacity onPress={handleConfirmDates} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>CONFIRM DATES</Text>
                        </TouchableOpacity>
                </View>
            </View>
        {/* </TouchableWithoutFeedback> */}
    </Modal>
        {/* ...other code */}
        </View>
    </TouchableWithoutFeedback>
);
}
