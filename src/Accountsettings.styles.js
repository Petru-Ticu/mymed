import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cccccc',
  },
  body: {
    flex: 1,
    backgroundColor: '#cccccc',
   // alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bodyContent: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  accountPanels: {
    margin: 10,
    marginTop: 30,
    marginLeft: 22,
    marginBottom: 45,
  },
  text: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 12
  },
  accountInputs: {
    height: 40, // Adjust as needed
    fontSize: 16,
    borderWidth: 0.15,
    borderRadius: 5,
  },
  genderButton: {
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  birthDateButton: {
    backgroundColor: '#D1FFD1',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#000000',
  },
  genderPanelOrdering: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentGender: {
    width: '60%',
    height: '45%',
    backgroundColor: '#cccccc',
    paddingTop: 40,
    paddingHorizontal: 30,
    paddingBottom: 80,
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContentBirthDate: {
    width: '95%',
    height: '50%',
    backgroundColor: '#cccccc',
    paddingTop: 40,
    paddingHorizontal: 30,
    paddingBottom: 80,
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  modalScrollView: {
    width: '100%',
    //paddingBottom: 60,
  },
  modalButton: {
    width: 140,
    height: 40,
    padding: 10,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#D1FFD1',
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  modalButtonBirthDate: {
    position: 'absolute', // Position the button absolutely
    bottom: 30, // Align at the bottom
    width: 200,
    height: 50,
    padding: 10,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#D1FFD1',
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  picker: {
    flex: 1,
    height: 150,
  },
  modalButtonTextBirthDate: {
    fontSize: 20,
    color: '#000000',
  },
  centeredText: {
    textAlign: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row', // Arrange columns horizontally
    justifyContent: 'space-evenly',
    alignItems: 'center',
    //height: '75%',
    width: '100%', 
    marginBottom: 20,
    
  },
  datePickerScrollView: {
    width: '30%',  // Adjust the width of each scroll view
  },
  datePickerColumnContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row', // Arrange the three lists horizontally
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', // Ensure it takes up the full width of the modal
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1, // Ensure all columns take up equal space
    alignItems: 'center',
    height: 150,
  },
  datePickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
},


  datePickerDivider: {
    width: 1, // Thickness of the black line
    height: '100%',
    backgroundColor: '#000', // Black color for the divider
  },
  
  greenHighlight: {
    position: 'absolute',
    top: (40 * 2), // Adjust this value as needed
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(50, 205, 50, 0.3)',
    zIndex: 1,
},
datePickerText: {
  fontSize: 16,
  lineHeight: 50, // Match this to the item height for vertical centering
  textAlign: 'center',
},
  confirmButton: {
    //position: 'absolute',
    padding: 10,
    bottom: 20,
    backgroundColor: '#D1FFD1',
    borderRadius: 5,
    alignItems: 'center',
    width: '80%', // Adjust width to fit the modal width
  },
  confirmButtonText: {
    color: '#000000',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#D1FFD1', 
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: 220, // Define a fixed width for the button
  
  },
  saveButtonText: {
    color: '#000000', 
    fontSize: 18,
    fontWeight: 'bold',
  },
});