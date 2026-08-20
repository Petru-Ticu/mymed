import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity,
 Modal, TouchableWithoutFeedback, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from './Header'; // Importing the Header component
import NavBar from './NavBar'; // Importing the NavBar component 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Importing MaterialIcons for icon usage
import { useMedicalList } from './MedicalListContext'; // Importing the useMedicalList context
import { MedicalReminderListsTransfer } from './meds_to_analytics_transfer'; // Import the transfer class
import { parseInventoryAmount, applyTakenDose } from './inventoryAmount';

const medicalRemindersModule = {
  lists: [],

  initialize(transfer) {
      this.transfer = transfer;
      this.lists = [];
  },

  addList(medicalList) {
      this.lists.push(medicalList);
      this.transfer.syncWithOriginal(this.lists);
      this.logLists();
  },

  removeList(index) {
      this.lists.splice(index, 1);
      this.transfer.syncWithOriginal(this.lists);
      this.logLists();
  },

  updateLists(newLists) {
    this.lists = [...newLists];
    this.transfer.syncWithOriginal(this.lists);
    this.logLists();
  },

  getList() {
      return this.lists;
  },

  logLists() {
      console.log('<------------------------------ START OF THE MYMEDS.JS FILE CURRENT LISTS !!! --------------------------------->');
      console.log('Current Lists with the JSON STRINGIFY FORMAT:', JSON.stringify(this.lists.map((list, index) => ({
          index,
          name: list.productName,
          details: {
              ...list,
              startAndEndDatesClass: list.startAndEndDatesClass
                  ? {
                      startDate: list.startAndEndDatesClass.startDate,
                      endDate: list.startAndEndDatesClass.endDate
                  }
                  : null
          }
      }))));
      console.log('<-------------------------------- END OF THE MYMEDS.JS FILE CURRENT LISTS !!! --------------------------------->');
  },

  debugLogCurrentState() {
      console.log('Detailed Current State:', this.lists.map(list => ({
          productName: list.productName,
          unit: list.unit,
          modalFrequency: list.modalFrequency,
          importantInfo: list.importantInfo,
          startAndEndDates: list.startAndEndDatesClass,
          time: list.time // Add other relevant fields here
      })));
  }
};

export { medicalRemindersModule };


export default function Mymeds() {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email;
  const { medicalLists, setMedicalLists, removeList } = useMedicalList(); // Getting medical lists and removeList function from context
  const windowHeight = Dimensions.get('window').height; //Getting the height of the user phone's screen
  const windowWidth = Dimensions.get('window').width; //Getting the width of the user phone's screen
  const styles = getStyles(windowWidth, windowHeight);


  // State to store the medication times extracted from the medical lists
  const [medicationTimes, setMedicationTimes] = useState([]);

  // State to keep track of which medication times have already triggered a log message
  const [loggedTimes, setLoggedTimes] = useState({});

  // State to keep track of the last minute that was checked to avoid repetitive checks within the same minute
  const [lastCheckedMinute, setLastCheckedMinute] = useState('');

  // State to open and close the Modal used for the situation when one or more 
  // list/s' amount value gets the same or smaller than the threshold value of the same list.
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  // State to show on the modal the list/s' Product Names that have an amount value that 
  // got the same or smaller than the threshold value from the same list.
  const [productsToRefill, setProductsToRefill] = useState([]);

  // State to open and close the Modal used for the situation when one or more 
  // list/s' amount value gets to 0.
  const [zeroAmountModalVisible, setZeroAmountModalVisible] = useState(false);

  // State to show on the modal the list/s' Product Names that have an amount value of 0.
  const [productsAtZeroAmount, setProductsAtZeroAmount] = useState([]);

  // State to open and close the new Modal for taking medications
  const [medicationModalVisible, setMedicationModalVisible] = useState(false);

  // State to store the current medications to be taken
  const [currentMedications, setCurrentMedications] = useState([]);

  // State to store the user's actions on the medication modal
  const [userActions, setUserActions] = useState({});

  // State to open and close the edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [editableList, setEditableList] = useState({
    productName: '',
    unit: '',
    modalFrequency: '',
    importantInfo: '',
    startDate: '',
    endDate: '',
  });

  // Initialize the MedicalReminderListsTransfer instance
  const medicalReminderTransfer = new MedicalReminderListsTransfer();

  /**
   * Class to manage the medical reminder lists
   */
class MedicalRemindersLists {
    constructor(transfer) {
        medicalRemindersModule.initialize(transfer);
    }

    addList(medicalList) {
        medicalRemindersModule.addList(medicalList);
    }

    removeList(index) {
        medicalRemindersModule.removeList(index);
    }

    updateLists(newLists) {
      medicalRemindersModule.updateLists(newLists);
    }

    getList() {
        return medicalRemindersModule.getList();
    }

    logLists() {
        medicalRemindersModule.logLists();
    }

    debugLogCurrentState() {
        medicalRemindersModule.debugLogCurrentState();
    }
}

  
  const medicalReminders = new MedicalRemindersLists(medicalReminderTransfer); // Create a global instance to use across the component
  //medicalReminders.lists = medicalLists; // Sync the instance with the medicalLists from context
  medicalReminders.updateLists(medicalLists); // Sync the instance with the initial medicalLists from context



  /**
   * Updates the medication times based on the provided lists
   * @param {Array} lists - The medical reminder lists
   */
  const updateMedicationTimes = (lists) => {
    const times = lists.map((list, index) => {
      // Regex pattern to match valid time (00:00 - 23:59) and medication count (1-99). AND OLD REGEXES ((/\d{2}:\d{2} - meds: \d+/g)
      const timeEntries = list.modalFrequency.match(/([01]\d|2[0-3]):([0-5]\d) - meds: ([1-9]|[1-9]\d)/g);
      return {
        index,
        times: timeEntries ? timeEntries.map(entry => {
          const [time, meds] = entry.split(' - meds: ');
          return { time, meds: parseInt(meds) };
        }) : []
      };
    });
    setMedicationTimes(times); // Set the medication times state
  };

  /**
   * useEffect to log lists and update medication times when the medicalLists state changes
   */
  useEffect(() => {
    medicalReminders.logLists(); // Log the lists on initial render and when medicalLists change
    updateMedicationTimes(medicalLists); // Update medication times
  }, [medicalLists]);


  /**
   * useEffect to set up an interval that checks medication times every second
   */
  useEffect(() => {
    const interval = setInterval(() => {
      checkMedicationTimes(); // Check medication times every second
    }, 1000); // Check every second

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [medicationTimes, loggedTimes, lastCheckedMinute]);



  /**
   * Checks the current time against the medication times and logs a message if it's time to take medication
   */
  const checkMedicationTimes = () => {
    const currentTime = new Date();
    const currentFormattedTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

    if (lastCheckedMinute !== currentFormattedTime) { // Check if the minute has changed
      setLastCheckedMinute(currentFormattedTime); // Update the last checked minute
      medicationTimes.forEach(list => {
        list.times.forEach((entry, entryIndex) => {
          if (entry.time === currentFormattedTime && !loggedTimes[entry.time]) { // Check if it's time to take medication
            //console.log(`You need to take ${entry.meds} med/s right now!`); // Log a message

            const reminderList = medicalLists[list.index];
            if (!reminderList) {
              return;
            }

            setCurrentMedications(prevMedications => [
              ...prevMedications,
              {
                key: `${list.index}-${entryIndex}`,
                index: list.index,
                productName: reminderList.productName,
                meds: entry.meds,
                amount: parseInventoryAmount(reminderList.modalFrequency)
              }
            ]);
            setMedicationModalVisible(true); // Show the medication modal


            setLoggedTimes(prevLoggedTimes => ({
              ...prevLoggedTimes,
              [entry.time]: true
            }));
          }
        });
      });

      // Reset loggedTimes at the start of a new minute
      setLoggedTimes(prevLoggedTimes => {
        const newLoggedTimes = { ...prevLoggedTimes };
        Object.keys(newLoggedTimes).forEach(key => {
          if (key !== currentFormattedTime) {
            delete newLoggedTimes[key]; // Remove old logged times
          }
        });
        return newLoggedTimes;
      });
    }
  };

  //const { width, height } = Dimensions.get('window');

  const handleTakeMed = (index, action) => {
    setUserActions(prevActions => ({
      ...prevActions,
      [index]: action
    }));
  };

  // Navigation handler for Account settings
  const handleAccountPress = () => {
    navigation.navigate('Accountsettings', { email: route.params?.email });
  };


  // Navigation handler for Notifications
  const handleNotificationsPress = () => {
    navigation.navigate('Notifications', { email: route.params?.email });
  };

  // Navigation handler for Home
  const handleHomePress = () => {
    navigation.navigate('Home', { email: route.params?.email });
  };

  // Navigation handler for My Analytics
  const handleMyAnalyticsPress = () => {
    navigation.navigate('Myanalytics', { email: route.params?.email });
  };

  // Navigation handler for My Meds (current page)
  const handleMyMedsPress = () => {
    navigation.navigate('Mymeds', { email: route.params?.email });
  };

  // Navigation handler for More
  const handleMorePress = () => {
    navigation.navigate('More', { email: route.params?.email });
  };

  const headerTopOffset = windowHeight * 0.055; // Offset for header positioning

  const [showModal, setShowModal] = useState(false); // State to control visibility of modal for adding medications
  const [selectedList, setSelectedList] = useState(null); // State to track the selected list for detailed view


  // Handler for list item press
  const handleListPress = (list) => {
    setSelectedList(list); // Set the selected list for detailed view
    logSelectedListDetails(list);
  };

  // Function to log selected list details in order
  const logSelectedListDetails = (list) => {
    if (list) {
      const formattedDetails = `
        Product Name: ${list.productName}
        Unit: ${list.unit}
        Frequency: ${list.modalFrequency}
        Important Info: ${formatImportantInfo(list.importantInfo)}
        Start Date: ${list.startAndEndDatesClass?.startDate}
        End Date: ${list.startAndEndDatesClass?.endDate}
      `;
      console.log(formattedDetails);
    }
  };

  

  // Handler for deleting a list item
  const handleDelete = (index, event) => {
    event.stopPropagation(); // Prevent event propagation to avoid triggering other click handlers
   medicalReminders.removeList(index); // Remove the list and also remove from analytics
   setMedicalLists([...medicalReminders.getList()]); // Update the state to trigger a re-render
  };

  useEffect(() => {
    console.log('Updated medicalLists state:', medicalLists);
    medicalReminders.lists = medicalLists; // Sync the instance with the medicalLists from context
}, [medicalLists]);


  

  const handleEdit = (index, event) => {
    event.stopPropagation();
    // Implement edit functionality here
    const list = medicalLists[index];
    const formattedFrequency = formatFrequency(list.modalFrequency);

    setEditableList({
      productName: list.productName,
      unit: list.unit,
      modalFrequency: formattedFrequency,
      importantInfo: formatImportantInfo(list.importantInfo),
      startDate: list.startAndEndDatesClass?.startDate || '',
      endDate: list.startAndEndDatesClass?.endDate || '',
    });
    
    setEditModalVisible(true);
    console.log(`Edit list at index ${index}`);
  };

   // Handler for closing the detailed view of the selected list
  const handleFullListClose = () => {
    setSelectedList(null); // Clear the selected list
  };

  // Handler for closing the edit modal
  const handleEditModalClose = () => {
    setEditModalVisible(false); // Hide the modal
  };

  // Handler for opening the modal to add a new medication
  const handleAddButtonPress = () => {
    setShowModal(true); // Show the modal
  };

  // Handler for closing the modal
  const handleModalClose = () => {
    setShowModal(false); // Hide the modal
  };

  // Handler for the scan button press in the modal
  const handleScanPress = () => {
    console.log('Scan button pressed');
    setShowModal(false); // Hide the modal
  };

  // Handler for the type button press in the modal
    const handleTypePress = () => {
        setShowModal(false); // Hide the modal
        navigation.navigate('MedicationTypingPage'); // Navigate to the MedicationTypingPage
    };

    const closeWarningModal = () => {
      setWarningModalVisible(false);
      setProductsToRefill([]);
    };

    const closeZeroAmountModal = () => {
      setZeroAmountModalVisible(false);
      setProductsAtZeroAmount([]);
    };

    const formatProductNames = (products) => {
      if (products.length === 0) {
        return '';
      } else if (products.length === 1) {
        return products[0];
      } else if (products.length === 2) {
        return `${products[0]} and ${products[1]}`;
      } else {
        return `${products.slice(0, -1).join(', ')}, and ${products[products.length - 1]}`;
      }
    };


    const handleCloseMedicationModal = () => {
      const newMedicalLists = [...medicalLists];
      let shouldShowWarning = false;
      let shouldShowZeroAmount = false;

      currentMedications.forEach(({ index, meds }) => {
        const action = userActions[index];
        if (action === 'took' && newMedicalLists[index]) {
          const result = applyTakenDose(newMedicalLists[index].modalFrequency, meds);
          newMedicalLists[index] = {
            ...newMedicalLists[index],
            modalFrequency: result.modalFrequency,
          };
          if (result.depleted) {
              shouldShowZeroAmount = true;
              setProductsAtZeroAmount(prevProducts => [...new Set([...prevProducts, newMedicalLists[index].productName])]);
          } else if (result.belowThreshold) {
              shouldShowWarning = true;
              setProductsToRefill(prevProducts => [...new Set([...prevProducts, newMedicalLists[index].productName])]);
          }
        }
      });

      setMedicalLists(newMedicalLists);
      medicalReminders.updateLists(newMedicalLists); // Sync updates with the transfer class
      setUserActions({});
      setCurrentMedications([]);
      setMedicationModalVisible(false);

      if (shouldShowZeroAmount) {
        setZeroAmountModalVisible(true);
      } else if (shouldShowWarning) {
        setWarningModalVisible(true);
      }
    };
  
    const formatImportantInfo = (text) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
  
      words.forEach(word => {
        if ((currentLine + word).length <= 35) {
          currentLine += `${word} `;
        } else {
          lines.push(currentLine.trim());
          currentLine = `${word} `;
        }
      });
  
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
      }
  
      return lines.slice(0, 6).join('\n');
    };

    const formatFrequency = (modalFrequency) => {
      if (modalFrequency.startsWith("Daily X Times a Day")) {
        const parts = modalFrequency.split('\n').map(part => part.trim());
        const createdAt = parts.find(part => part.startsWith("Created at:"));
        const timesInDay = parts.find(part => part.startsWith("Number of Times in a Day you are taking the Meds:"));
        const timesInDayTwo = parts.find(part => part.startsWith("Times when you are taking the Meds in a Day:"));
        const times = parts.filter(part => part.match(/^\d+\.\s\d{2}:\d{2} - meds: \d+/));
        const amount = parts.find(part => part.startsWith("Amount:"));
        const threshold = parts.find(part => part.startsWith("Threshold:"));
  
        return `Frequency: Daily X Times a Day\n\n${createdAt}\n\n${timesInDay}\n\n${timesInDayTwo}\n\n${times.join('\n\n')}\n\n${amount}\n\n${threshold}`;
      } else if (modalFrequency.startsWith("As Needed (PRN)")) {
        const parts = modalFrequency.split('\n').map(part => part.trim());
        const createdAt = parts.find(part => part.startsWith("Created at:"));
        const maxMeds = parts.find(part => part.startsWith("Maximum Number of Meds Per Day:"));
        const amount = parts.find(part => part.startsWith("Amount:"));
        const threshold = parts.find(part => part.startsWith("Threshold:"));
  
        return `Frequency: As Needed (PRN)\n\n${createdAt}\n\n${maxMeds}\n\n${amount}\n\n${threshold}`;
      }
      return modalFrequency;
    };




    const EditModalContent = ({ editableList, setEditableList }) => {
      const [focusedField, setFocusedField] = useState(null);
      const inputRefs = useRef({});
    
      const handleFrequencyChange = (field, value) => {
        const parts = editableList.modalFrequency.split('\n\n');
        const updatedFrequency = parts.map(part => {
          if (part.startsWith(field)) {
            return `${field}${value}`;
          }
          return part;
        }).join('\n\n');
        setEditableList({ ...editableList, modalFrequency: updatedFrequency });
      };
    
      const getFrequencyPart = (field) => {
        const part = editableList.modalFrequency.split('\n\n').find(part => part.startsWith(field));
        return part ? part.split(': ')[1] : '';
      };
    
      useEffect(() => {
        if (focusedField && inputRefs.current[focusedField]) {
          inputRefs.current[focusedField].focus();
        }
      }, [focusedField, editableList]);
    
      const handleFocus = (field) => {
        setFocusedField(field);
      };
    
      const renderFrequencyFields = () => {
        if (editableList.modalFrequency.startsWith('Frequency: As Needed (PRN)')) {
          return (
            <>
              <Text>{'Frequency: As Needed (PRN)'}</Text>
              <Text>{'Created at: '}</Text>
              <TextInput
                style={styles.textInput}
                value={getFrequencyPart('Created at: ')}
                ref={ref => inputRefs.current['createdAt'] = ref}
                editable={false}
              />
              <Text>{'Maximum Number of Meds Per Day: '}</Text>
              <TextInput
                style={styles.textInput}
                value={getFrequencyPart('Maximum Number of Meds Per Day: ')}
                ref={ref => inputRefs.current['maxMeds'] = ref}
                onFocus={() => handleFocus('maxMeds')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => handleFrequencyChange('Maximum Number of Meds Per Day: ', text)}
              />
              <Text>{'Amount: '}</Text>
              <TextInput
                style={styles.textInput}
                value={getFrequencyPart('Amount: ')}
                ref={ref => inputRefs.current['amount'] = ref}
                onFocus={() => handleFocus('amount')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => handleFrequencyChange('Amount: ', text)}
                keyboardType="numeric"
              />
              <Text>{'Threshold: '}</Text>
              <TextInput
                style={styles.textInput}
                value={getFrequencyPart('Threshold: ')}
                ref={ref => inputRefs.current['threshold'] = ref}
                onFocus={() => handleFocus('threshold')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => handleFrequencyChange('Threshold: ', text)}
                keyboardType="numeric"
              />
            </>
          );
        } else if (editableList.modalFrequency.startsWith('Frequency: Daily X Times a Day')) {
          return (
            <>
              <Text>{editableList.modalFrequency.split('\n\n')[0]}</Text>
              <Text>{'Created at: '}</Text>
              <TextInput
                style={styles.textInput}
                value={getFrequencyPart('Created at: ')}
                ref={ref => inputRefs.current['createdAt'] = ref}
                editable={false}
              />
              <TextInput
                style={styles.textInput}
                value={editableList.modalFrequency.split('\n\n').slice(2).join('\n\n')}
                ref={ref => inputRefs.current['dailyTimes'] = ref}
                onFocus={() => handleFocus('dailyTimes')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => {
                  const parts = editableList.modalFrequency.split('\n\n');
                  const updatedFrequency = `Frequency: ${parts[0]}\n\nCreated at: ${getFrequencyPart('Created at: ')}\n\n${text}`;
                  setEditableList({ ...editableList, modalFrequency: updatedFrequency });
                }}
                multiline
              />
            </>
          );
        }
        return null;
      };
    
      return (
        <>
          <View style={styles.textContainerEditProductName}>
            <Text style={styles.editSeparator}>{`Product Name: `}</Text>
            <TextInput
              style={styles.textInput}
              value={editableList.productName}
              ref={ref => inputRefs.current['productName'] = ref}
              onFocus={() => handleFocus('productName')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => setEditableList({ ...editableList, productName: text })}
            />
          </View>
          <View style={styles.textContainerEditUnit}>
            <Text style={styles.editSeparator}>{`Unit: `}</Text>
            <TextInput
              style={styles.textInput}
              value={editableList.unit}
              ref={ref => inputRefs.current['unit'] = ref}
              onFocus={() => handleFocus('unit')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => setEditableList({ ...editableList, unit: text })}
            />
          </View>
          <View style={styles.textContainerEditModalFrequency}>
            <Text style={styles.editSeparator}>Frequency: </Text>
            {renderFrequencyFields()}
          </View>
          <View style={styles.textContainerEditImportantInfo}>
            <Text style={styles.editSeparator}>{`Important Info: `}</Text>
            <TextInput
              style={styles.textInput}
              value={editableList.importantInfo}
              ref={ref => inputRefs.current['importantInfo'] = ref}
              onFocus={() => handleFocus('importantInfo')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => {
                if (text.length <= 200) {
                  const words = text.split(' ');
                  const formattedLines = [];
                  let currentLine = '';
    
                  words.forEach((word) => {
                    if ((currentLine + word).length <= 33) {
                      currentLine += `${word} `;
                    } else {
                      formattedLines.push(currentLine.trim());
                      currentLine = `${word} `;
                    }
                  });
    
                  if (currentLine.length > 0) {
                    formattedLines.push(currentLine.trim());
                  }
    
                  if (formattedLines.length <= 6) {
                    setEditableList({ ...editableList, importantInfo: text });
                  } else {
                    const truncatedText = formattedLines.slice(0, 6).join(' ');
                    setEditableList({ ...editableList, importantInfo: truncatedText });
                  }
                }
              }}
              multiline
              scrollEnabled={false}
              maxLength={200}
            />
          </View>
          <View style={styles.textContainerEditStartDate}>
            <Text style={styles.editSeparator}>{`Start Date: `}</Text>
            <TextInput
              style={styles.textInput}
              value={editableList.startDate}
              ref={ref => inputRefs.current['startDate'] = ref}
              onFocus={() => handleFocus('startDate')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => setEditableList({ ...editableList, startDate: text })}
            />
          </View>
          <View style={styles.textContainerEditEndDate}>
            <Text style={styles.editSeparator}>{`End Date: `}</Text>
            <TextInput
              style={styles.textInput}
              value={editableList.endDate}
              ref={ref => inputRefs.current['endDate'] = ref}
              onFocus={() => handleFocus('endDate')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => setEditableList({ ...editableList, endDate: text })}
            />
          </View>
        </>
      );
    };
    
    
    
    
    
    
     
    

  return (
    <View style={styles.container}>
      <Header
        handleAccountPress={handleAccountPress}
        handleNotificationsPress={handleNotificationsPress}
        email={email}
        headerTopOffset={headerTopOffset}
      />
      <ScrollView style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}> 
      <View style={styles.body}>
{medicalLists.length === 0 ? (
            <Text style={styles.emptyListsText}>There are no Medical Reminder list/s{'\n'}right now created!</Text>
          ) : (
            medicalLists.map((list, index) => (
              <TouchableOpacity key={`${index}-${list.productName}`} style={styles.medicalReminderGenList} onPress={() => handleListPress(list)}>
                <View style={styles.textContainerProductName}>
                  <Text>{`${list.productName}`}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={(e) => handleDelete(index, e)}>
              <MaterialIcons name="delete" size={28} color="#ffffff"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={(e) => handleEdit(index, e)}>
                  <MaterialIcons name="edit" size={28} color="#ffffff" />
            </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
      </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
          <MaterialIcons name="add" size={42} color="#000000" />
        </TouchableOpacity>

      <NavBar
        handleHomePress={handleHomePress}
        handleMyAnalyticsPress={handleMyAnalyticsPress}
        handleMyMedsPress={handleMyMedsPress}
        handleMorePress={handleMorePress}
        windowHeight={windowHeight}
      />
      {selectedList && (
        <Modal visible={true} transparent onRequestClose={handleFullListClose}>
          <View style={styles.modalContainerFullList}>
              
               <View style={styles.medicalReminderFullGenList}>
               <ScrollView style={styles.modalFullListContent}
                showsVerticalScrollIndicator={false}
               >
                <TouchableOpacity style={styles.textContainerCancelFullList} onPress={handleFullListClose}>
                  <Text style={styles.textCancelFullList}>CANCEL</Text>
                </TouchableOpacity>
                <View style={styles.textContainerProductName}>
                  <Text>{`Product Name: ${selectedList.productName}`}</Text>
                </View>  
                <View style={styles.textContainerUnit}>
                  <Text>{`Unit: ${selectedList.unit}`}</Text>
                </View>
                <View style={styles.textContainerModalFrequency}>
                  <Text>{`Frequency: ${selectedList.modalFrequency}`}</Text>
                </View>
                <View style={styles.textContainerImportantInfo}>
                  <Text>{`Important Info: ${formatImportantInfo(selectedList.importantInfo)}`}</Text>
                </View>  
                <View style={styles.textContainerStartDate}>
                  <Text>{`Start Date: ${selectedList.startAndEndDatesClass?.startDate}`}</Text>
                </View>
                <View style={styles.textContainerEndDate}>
                  <Text>{`End Date: ${selectedList.startAndEndDatesClass?.endDate}`}</Text>
                </View>
                <TouchableOpacity style={styles.textContainerCancelFullList} onPress={handleFullListClose}>
                <Text style={styles.textCancelFullList}>CANCEL</Text>
                </TouchableOpacity>
                </ScrollView>
               </View>
          </View>
        </Modal>
      )}

<Modal visible={editModalVisible} transparent onRequestClose={handleEditModalClose}>
        <View style={styles.modalContainerEditList}>
          <View style={styles.edidButtonModal}>
            <TouchableOpacity style={styles.textContainerCancelFullList} onPress={handleEditModalClose}>
              <Text style={styles.textCancelFullList}>CANCEL</Text>
            </TouchableOpacity>
            <Text style={styles.textEdit}>BELOW YOU CAN EDIT YOUR MEDICATION LIST!</Text>
            <ScrollView style={[styles.modalFullListContent, { backgroundColor: '#D1FFD1' }]}
                showsVerticalScrollIndicator={false}
               >
                

                <EditModalContent editableList={editableList} setEditableList={setEditableList} />

            </ScrollView>
            <TouchableOpacity style={styles.textContainerCancelFullList} onPress={handleEditModalClose}>
              <Text style={styles.textCancelFullList}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      
      <Modal visible={showModal} transparent onRequestClose={handleModalClose}>
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalContainerAddListButton}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>How do you want to add your medication?</Text>
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleScanPress}>
                    <Text style={styles.modalButtonText}>By Scanning</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={handleTypePress}>
                    <Text style={styles.modalButtonText}>By Typing</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>



      <Modal visible={warningModalVisible} transparent onRequestClose={closeWarningModal}>
        <View style={styles.warningModalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningText}>You need to get more Meds into your {formatProductNames(productsToRefill)} Inventory!</Text>
            <TouchableOpacity style={styles.warningButton} onPress={closeWarningModal}>
              <Text style={styles.warningButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



      <Modal visible={zeroAmountModalVisible} transparent onRequestClose={closeZeroAmountModal}>
        <View style={styles.warningModalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningText}>You need to add med/s to your Inventory because the {formatProductNames(productsAtZeroAmount)} are empty!</Text>
            <TouchableOpacity style={styles.warningButton} onPress={closeZeroAmountModal}>
              <Text style={styles.warningButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



      <Modal visible={medicationModalVisible} transparent onRequestClose={handleCloseMedicationModal}>
        <View style={styles.warningModalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningText}>You need to take these med/s now!</Text>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
              {currentMedications.map(({ index, productName, meds }) => (
                <View key={`${index}-${productName}-${meds}`} style={styles.medicationRow}>
                  <Text style={styles.medicationText}>{`${productName} - Take ${meds}`}</Text>
                  <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.warningButtonTakeAndDidntTake, { backgroundColor: 'green' }]}
                    onPress={() => handleTakeMed(index, 'took')}
                  >
                    <Text style={styles.warningButtonTake}>I TOOK IT!</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.warningButtonTakeAndDidntTake, { backgroundColor: 'red' }]}
                    onPress={() => handleTakeMed(index, 'didnt')}
                  >
                    <Text style={styles.warningButtonDidntTake}>I DIDN'T TOOK IT!</Text>
                  </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.warningButton} onPress={handleCloseMedicationModal}>
              <Text style={styles.warningButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(windowWidth, windowHeight) {
 return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cccccc',
  },
  body: {
    flex: 1,
    backgroundColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80, // Account for the height of the navbar
  },
  textContainerProductName: {
    borderWidth: 1,
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 17,
    paddingBottom: 17,
    marginBottom: 25,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 50,
    maxHeight: 70,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerEditProductName: {
    backgroundColor: '#D1FFD1',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 1,
    paddingBottom: 1,
    marginTop: 20,
    marginBottom: 5,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 50,
    maxHeight: 70,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerUnit: {
    borderWidth: 1,
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 50,
    maxHeight: 50,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerEditUnit: {
    backgroundColor: '#D1FFD1',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 1,
    paddingBottom: 1,
    marginVertical: 1, // Give some space between each text box
    borderRadius: 10,
    minHeight: 50,
    maxHeight: 50,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerModalFrequency: {
    borderWidth: 1,
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 13,
    paddingBottom: 13,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 220,
    //maxHeight: 220,
    //height: 220,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerEditModalFrequency: {
    backgroundColor: '#D1FFD1',
    paddingLeft: 10,
    paddingRight: 10,
    //paddingTop: 1,
    paddingBottom: 1,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 100,
    //maxHeight: 220,
    //height: 220,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerImportantInfo: {
    borderWidth: 1,
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 17,
    paddingBottom: 17,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 120,
    //maxHeight: 180,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerEditImportantInfo: {
    backgroundColor: '#D1FFD1',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 1,
    paddingBottom: 30,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 10,
    //maxHeight: 180,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerStartDate: {
    borderWidth: 1,
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 40,
    maxHeight: 40,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerEditStartDate: {
    backgroundColor: '#D1FFD1',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 50,
    maxHeight: 50,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerEndDate: {
    borderWidth: 1,
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 50,
    maxHeight: 50,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textContainerEditEndDate: {
    backgroundColor: '#D1FFD1',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 5, // Give some space between each text box
    borderRadius: 10,
    minHeight: 40,
    maxHeight: 40,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  editSeparator: {
    paddingBottom: 10,
  },
  textContainerCancelFullList: {
    borderWidth: 1,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 35, // Give some space between each text box
    borderRadius: 10,
    minHeight: 40,
    maxHeight: 40,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  medicalReminderGenList: {
    backgroundColor: '#ffffff',
    padding: 20,
    //paddingBottom: windowHeight * 0.085,
    paddingHorizontal: 20, // Side padding
    paddingTop: 20, // Top padding
    marginHorizontal: 40,
    marginBottom: 40,
    margin: 40,
    width: windowWidth * 0.628, 
    height: windowHeight * 0.18, 
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: {
        width: 10,
        height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 3, // subtle border
    borderColor: '#ddd', // light grey border for a soft separation
    elevation: 20,
    overflow: 'hidden',
},
medicalReminderFullGenList: {
  backgroundColor: '#cccccc',
  padding: 20,
  paddingHorizontal: 40, // Side padding
  paddingTop: 20, // Top padding
  marginHorizontal: 20,
  marginBottom: 40,
  margin: 60,
  width: windowWidth * 0.9, 
  height: windowHeight * 0.8, 
  borderRadius: 10,
  shadowColor: "#000000",
  shadowOffset: {
      width: 10,
      height: 6,
  },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  borderWidth: 3, // subtle border
  borderColor: '#cccccc', 
  elevation: 20,
  overflow: 'hidden',
},
edidButtonModal: {
  backgroundColor: '#cccccc',
  padding: 20,
  paddingHorizontal: 40, // Side padding
  paddingTop: 20, // Top padding
  marginHorizontal: 20,
  marginBottom: 40,
  margin: 60,
  width: windowWidth * 0.96, 
  height: windowHeight * 0.86, 
  borderRadius: 10,
  shadowColor: "#000000",
  shadowOffset: {
      width: 10,
      height: 6,
  },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  borderWidth: 3, // subtle border
  borderColor: '#cccccc', 
  elevation: 20,
  overflow: 'hidden',
},
textEdit: {
  color: '#000000',
  fontWeight: 'bold',
  fontSize: 14.545,
  paddingBottom: 30,
},
  addButton: {
    position: 'absolute',
    bottom: 220, // Adjust the bottom position as needed
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1FFD1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainerAddListButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainerFullList: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainerEditList: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'trasparent',
    borderRadius: 5,
    padding: 30
  },     
  modalFullListContent: {
    flexGrow: 1,
  },
  modalEditContent: {
    flexGrow: 1,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: '#D1FFD1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  emptyListsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  textCancelFullList: {
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 6,
    borderRadius: 5,
    width: 42,
    alignItems: 'center',
    position: 'absolute',
    left: 10,
    top: 10,
    marginTop: 95,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 6,
    borderRadius: 5,
    width: 42,
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    marginTop: 95,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  warningModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  warningModal: {
    width: '95%',
    height: '40%',
    backgroundColor: 'gray',
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  warningText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    paddingBottom: 10,
  },
  warningButton: {
    backgroundColor: '#D1FFD1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15
  },
  warningButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  warningButtonTakeAndDidntTake: {
    //backgroundColor: 'yellow',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  warningButtonTake: {
    color: '#000000',
    fontSize: 13,
  },
  warningButtonDidntTake: {
    color: '#000000',
    fontSize: 13,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  
});
}
