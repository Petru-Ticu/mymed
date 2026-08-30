import React from 'react';
import { TouchableOpacity, View, Text, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { colors } from './theme/colors';

// Placeholder for "Daily, every X hours". Wired from the frequency picker; fields are not collected yet.
export default function DailyEveryXHoursModal({ visible, onClose, validate }) {
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
            <Text style={styles.modalTitle}>Necessary Questions</Text>
            <Text style={styles.modalQuestion}>How many hours between each dose?</Text>
            <Text style={styles.modalQuestion}>What is the maximum number of pills, drops, etc. that you can take daily?</Text>
            <TouchableOpacity style={styles.doneButton} onPress={handleModalClose}>
              <Text style={styles.doneButtonText}>Done</Text>
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
