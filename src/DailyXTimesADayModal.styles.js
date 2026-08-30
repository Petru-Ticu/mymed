import { Dimensions, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
      backgroundColor: '#cccccc',
      borderRadius: 5,
      padding: 30,
      height: Dimensions.get('window').height * 0.85, 
      width: '95%',
  },
  scrollContent: {
    flexGrow: 1,
    marginBottom: 20,
  },
  headerModal: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start', 
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 20,
      marginBottom: 22,
  },
  arrowTitle: {
      marginLeft: 0.5,
      marginBottom: 19, 
  },
  modalQuestion: {
    marginLeft: 1,
    fontSize: 16,
    color: '#000000',
    marginTop: 30,
    marginBottom: 10,
},
timeInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 8,
},
  inputIntakeVal: {
        borderWidth: 1,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        color: '#000000',
        borderRadius: 10,
        padding: 10,
        width: 60,
        margin: 10,
  },
  timeInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  inputTimes: {
    borderBottomWidth: 2,
    width: 40, 
    textAlign: 'center',
    fontSize: 22,
    marginHorizontal: 5,
  },  
  colon: {
    fontSize: 26,
    marginHorizontal: 5,
    alignSelf: 'flex-end',
    marginBottom: 3
  },
  inputMedsNum: {
    height: 36, 
    width: 50,
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 4,
    color: '#000000',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#000000",
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    height: 40,
    lineHeight: 20,
    marginBottom: 30,
    fontSize: 14,
    marginLeft: 10,
    marginTop: 4,
  },
  errorContainerTimeValuesIntakeDailyXTAD: {
    marginTop: 10,
    marginBottom: 25,
    height: 15,
  },
  errorContainerDeletedTimeValuesIntakeDailyXTAD: {
    marginTop: 10,
  },
  errorContainerMedsNumberSum: {
    height: 20,
    marginTop: 10,
    marginBottom: 10
  },
  errorContainerHourAndMinute: {
    height: 25,
    marginTop: 20,
    marginBottom: 5
  },
  errorContainerMeds: {
    height: 30,
    marginTop: 10,
    marginBottom: 5
  },
  errorContainerHourAndMinuteBottom: {
    height: 25,
    marginTop: -20,
    marginBottom: 25
  },
  errorContainerMedsBottom: {
    height: 30,
    marginTop: -10,
    marginBottom: 5
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centeredTimeContainer: {
    paddingTop: 15,    
    paddingBottom: 15,
},
  leftTimeContainer: {
    flex: 1.52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightPillContainer: {
    flex: 0.48,
    alignItems: 'flex-start', 
  },
  timePart: {
    fontSize: 20,
    color: '#000000',
    marginHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  focusedTime: {
    borderBottomColor: '#D1FFD1',
    borderBottomWidth: 2,
  },
  separatorLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
},
  doneButton: {
      alignSelf: 'center', 
      backgroundColor: '#D1FFD1',
      padding: 10,
      borderRadius: 10,
      width: '85%',
      marginTop: 20,
      marginBottom: 10,
  },
  doneButtonText: {
      color: '#000000',
      textAlign: 'center',
      fontSize: 18,
  },
});
