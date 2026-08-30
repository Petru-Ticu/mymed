import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from './theme/colors';

const { width, height } = Dimensions.get('window');

export default function FrequencyModalLayout({ onBackPress, title, children, onDonePress }) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.headerModal}>
          <TouchableOpacity onPress={onBackPress}>
            <View style={styles.arrowTitle}>
              <Icon name="arrow-back" size={25} color={colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        <TouchableOpacity onPress={onDonePress} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    width: width * 0.95,
    maxHeight: height * 0.85,
    minHeight: height * 0.85,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 22,
    marginLeft: 20,
  },
  arrowTitle: {
    marginLeft: 0.5,
    marginBottom: 19,
  },
  headerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
    marginBottom: 0,
  },
  doneButton: {
    alignSelf: 'center',
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 10,
    width: '85%',
    marginTop: 20,
    marginBottom: 10,
  },
  doneButtonText: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
  },
});
