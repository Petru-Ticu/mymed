import React from 'react';
import { TouchableOpacity, View, Text, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { colors } from './theme/colors';
import { useI18n } from './i18n';

// Placeholder for "Daily, every X hours". Wired from the frequency picker; fields are not collected yet.
export default function DailyEveryXHoursModal({ visible, onClose, validate }) {
  const { t } = useI18n();
  const handleModalClose = () => {
    if (validate()) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent onRequestClose={handleModalClose}>
      <TouchableWithoutFeedback onPress={handleModalClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('meds.necessaryQuestions')}</Text>
            <Text style={styles.modalQuestion}>{t('meds.hoursBetween')}</Text>
            <Text style={styles.modalQuestion}>{t('meds.maxDaily')}</Text>
            <TouchableOpacity style={styles.doneButton} onPress={handleModalClose}>
              <Text style={styles.doneButtonText}>{t('meds.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 5,
    padding: 30,
    height: '72%',
    width: '89.5%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalQuestion: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 10,
  },
  doneButtonText: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 18,
  },
});
