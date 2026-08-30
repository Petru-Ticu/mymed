import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity,
 Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppScreen from './layout/AppScreen';
import { useAppNavigation } from './navigation/useAppNavigation';
import { useMedicalList } from './MedicalListContext';
import { isAsNeededList } from './medicationDoseActions';
import { useDoseActions } from './DoseReminderHost';
import { getStyles } from './Mymeds.styles';
import { useI18n } from './i18n';
import { unitLabel } from './i18n/labels';

export default function Mymeds() {
  const { navigation, windowHeight, windowWidth } = useAppNavigation();
  const { medicalLists, removeList } = useMedicalList();
  const { openAsNeededTake } = useDoseActions();
  const { t } = useI18n();
  const styles = getStyles(windowWidth, windowHeight);

  useEffect(() => {
    console.log('Updated medicalLists state:', medicalLists);
  }, [medicalLists]);

  const [showModal, setShowModal] = useState(false); // State to control visibility of modal for adding medications
  const [selectedList, setSelectedList] = useState(null);


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
    event.stopPropagation();
    removeList(index);
  };

  const handleEdit = (index, event) => {
    event.stopPropagation();
    const list = medicalLists[index];
    navigation.navigate('MedicationTypingPage', {
      mode: 'edit',
      listIndex: index,
      list: {
        id: list.id,
        productName: list.productName,
        unit: list.unit,
        modalFrequency: list.modalFrequency,
        importantInfo: list.importantInfo,
        startAndEndDatesClass: list.startAndEndDatesClass,
        createdOn: list.createdOn,
        createdAt: list.createdAt,
      },
    });
  };

   // Handler for closing the detailed view of the selected list
  const handleFullListClose = () => {
    setSelectedList(null); // Clear the selected list
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
        setShowModal(false);
        navigation.navigate('MedicationTypingPage', { mode: 'create' });
    };

    const handleAsNeededPress = (list, event) => {
      event.stopPropagation();
      openAsNeededTake(list);
    };

    const formatImportantInfo = (text) => {
      const words = (text || '').split(' ');
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

  return (
    <AppScreen>
      <ScrollView style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}> 
      <View style={styles.body}>
{medicalLists.length === 0 ? (
            <Text style={styles.emptyListsText}>{t('meds.empty')}</Text>
          ) : (
            medicalLists.map((list, index) => (
              <TouchableOpacity key={`${index}-${list.productName}`} style={styles.medicalReminderGenList} onPress={() => handleListPress(list)}>
                <View style={styles.textContainerProductName}>
                  <Text>{`${list.productName}`}</Text>
                </View>
                <View style={styles.cardActionRow} pointerEvents="box-none">
                  <View style={styles.cardActionCell}>
                    <TouchableOpacity style={styles.deleteButton} onPress={(e) => handleDelete(index, e)}>
                      <MaterialIcons name="delete" size={28} color="#ffffff"/>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardActionCell}>
                    {isAsNeededList(list) ? (
                      <TouchableOpacity style={styles.takeButton} onPress={(e) => handleAsNeededPress(list, e)}>
                        <Text style={styles.takeButtonMark}>+</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <View style={styles.cardActionCell}>
                    <TouchableOpacity style={styles.editButton} onPress={(e) => handleEdit(index, e)}>
                      <MaterialIcons name="edit" size={28} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
      </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
          <MaterialIcons name="add" size={42} color="#000000" />
        </TouchableOpacity>

      {selectedList && (
        <Modal visible={true} transparent onRequestClose={handleFullListClose}>
          <View style={styles.modalContainerFullList}>
              
               <View style={styles.medicalReminderFullGenList}>
               <ScrollView style={styles.modalFullListContent}
                showsVerticalScrollIndicator={false}
               >
                <TouchableOpacity style={styles.textContainerCancelFullList} onPress={handleFullListClose}>
                  <Text style={styles.textCancelFullList}>{t('meds.cancel')}</Text>
                </TouchableOpacity>
                <View style={styles.textContainerProductName}>
                  <Text>{t('meds.detailProduct', { name: selectedList.productName })}</Text>
                </View>  
                <View style={styles.textContainerUnit}>
                  <Text>{t('meds.detailUnit', { unit: unitLabel(selectedList.unit) })}</Text>
                </View>
                <View style={styles.textContainerModalFrequency}>
                  <Text>{t('meds.detailFrequency', { frequency: selectedList.modalFrequency })}</Text>
                </View>
                <View style={styles.textContainerImportantInfo}>
                  <Text>{t('meds.detailImportant', { info: formatImportantInfo(selectedList.importantInfo) })}</Text>
                </View>  
                <View style={styles.textContainerStartDate}>
                  <Text>{t('meds.detailStart', { date: selectedList.startAndEndDatesClass?.startDate })}</Text>
                </View>
                <View style={styles.textContainerEndDate}>
                  <Text>{t('meds.detailEnd', { date: selectedList.startAndEndDatesClass?.endDate })}</Text>
                </View>
                <TouchableOpacity style={styles.textContainerCancelFullList} onPress={handleFullListClose}>
                <Text style={styles.textCancelFullList}>{t('meds.cancel')}</Text>
                </TouchableOpacity>
                </ScrollView>
               </View>
          </View>
        </Modal>
      )}

      
      <Modal visible={showModal} transparent onRequestClose={handleModalClose}>
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalContainerAddListButton}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>{t('meds.addHow')}</Text>
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleScanPress}>
                    <Text style={styles.modalButtonText}>{t('meds.byScanning')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={handleTypePress}>
                    <Text style={styles.modalButtonText}>{t('meds.byTyping')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AppScreen>
  );
}
