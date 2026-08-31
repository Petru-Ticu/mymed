import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppScreen from './layout/AppScreen';
import { useAppNavigation } from './navigation/useAppNavigation';
import { useMedicalList } from './MedicalListContext';
import { isAsNeededList } from './medicationDoseActions';
import { useDoseActions } from './DoseReminderHost';
import { getStyles } from './Mymeds.styles';
import { useI18n } from './i18n';
import { unitLabel } from './i18n/labels';
import { getMedListSummary } from './utils/medListSummary';
import AppButton from './ui/AppButton';

export default function Mymeds() {
  const { navigation, windowHeight, windowWidth } = useAppNavigation();
  const { medicalLists, removeList } = useMedicalList();
  const { openAsNeededTake } = useDoseActions();
  const { t } = useI18n();
  const styles = getStyles(windowWidth, windowHeight);

  const [showModal, setShowModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  const handleListPress = (list) => {
    setSelectedList(list);
  };

  const handleDelete = (index, list) => {
    Alert.alert(
      t('meds.deleteTitle'),
      t('meds.deleteBody', { name: list?.productName || '' }),
      [
        { text: t('more.cancel'), style: 'cancel' },
        {
          text: t('meds.delete'),
          style: 'destructive',
          onPress: () => removeList(index),
        },
      ],
    );
  };

  const handleEdit = (index) => {
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
        barcode: list.barcode,
      },
    });
  };

  const handleFullListClose = () => {
    setSelectedList(null);
  };

  const handleAddButtonPress = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleScanPress = () => {
    setShowModal(false);
    navigation.navigate('MedicationScan');
  };

  const handleTypePress = () => {
    setShowModal(false);
    navigation.navigate('MedicationTypingPage', { mode: 'create' });
  };

  const handleAsNeededPress = (list) => {
    openAsNeededTake(list);
  };

  const formatImportantInfo = (text) => {
    const words = (text || '').split(' ');
    const lines = [];
    let currentLine = '';
    words.forEach((word) => {
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

  const scheduleLine = (list) => {
    const summary = getMedListSummary(list);
    if (summary.asNeeded) {
      return t('meds.asNeededSchedule');
    }
    if (summary.due && summary.time) {
      return t('meds.dueAt', { time: summary.time });
    }
    if (summary.time) {
      return t('meds.nextAt', { time: summary.time });
    }
    return t('meds.noUpcoming');
  };

  const doseLine = (list) => {
    const summary = getMedListSummary(list);
    const unit = unitLabel(summary.unit);
    if (summary.quantity) {
      return t('home.takeLine', { quantity: summary.quantity, unit });
    }
    return unit;
  };

  return (
    <AppScreen>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {medicalLists.length === 0 ? (
            <Text style={styles.emptyListsText}>{t('meds.empty')}</Text>
          ) : (
            medicalLists.map((list, index) => {
              const summary = getMedListSummary(list);
              return (
                <TouchableOpacity
                  key={`${list.id || index}-${list.productName}`}
                  style={styles.medicalReminderGenList}
                  onPress={() => handleListPress(list)}
                  accessibilityRole="button"
                  accessibilityLabel={list.productName}
                >
                  <Text style={styles.cardName} numberOfLines={2}>{list.productName}</Text>
                  <Text style={styles.cardMeta}>{scheduleLine(list)}</Text>
                  {doseLine(list) ? <Text style={styles.cardMeta}>{doseLine(list)}</Text> : null}
                  {summary.amount != null ? (
                    <Text style={styles.cardMeta}>{t('meds.inventory', { amount: summary.amount })}</Text>
                  ) : null}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(index, list)}
                      accessibilityRole="button"
                      accessibilityLabel={t('meds.delete')}
                    >
                      <MaterialIcons name="delete" size={22} color="#ffffff" />
                    </TouchableOpacity>
                    {isAsNeededList(list) ? (
                      <TouchableOpacity
                        style={styles.takeButton}
                        onPress={() => handleAsNeededPress(list)}
                        accessibilityRole="button"
                        accessibilityLabel={t('meds.take')}
                      >
                        <Text style={styles.takeButtonMark}>+</Text>
                      </TouchableOpacity>
                    ) : <View style={styles.actionSpacer} />}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(index)}
                      accessibilityRole="button"
                      accessibilityLabel={t('meds.edit')}
                    >
                      <MaterialIcons name="edit" size={22} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddButtonPress}
        accessibilityRole="button"
        accessibilityLabel={t('meds.add')}
      >
        <MaterialIcons name="add" size={36} color="#000000" />
      </TouchableOpacity>

      {selectedList ? (
        <Modal visible transparent onRequestClose={handleFullListClose}>
          <View style={styles.modalContainerFullList}>
            <View style={styles.medicalReminderFullGenList}>
              <ScrollView style={styles.modalFullListContent} showsVerticalScrollIndicator={false}>
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
                {selectedList.barcode ? (
                  <View style={styles.textContainerUnit}>
                    <Text>{t('meds.detailBarcode', { code: selectedList.barcode })}</Text>
                  </View>
                ) : null}
                <View style={styles.textContainerStartDate}>
                  <Text>{t('meds.detailStart', { date: selectedList.startAndEndDatesClass?.startDate })}</Text>
                </View>
                <View style={styles.textContainerEndDate}>
                  <Text>{t('meds.detailEnd', { date: selectedList.startAndEndDatesClass?.endDate })}</Text>
                </View>
                <AppButton label={t('meds.close')} variant="secondary" onPress={handleFullListClose} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}

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
