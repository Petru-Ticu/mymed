import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cccccc',
  },
  header: {
    backgroundColor: '#D1FFD1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 60,
  },
  backButton: {
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 18.5,
    color: '#000000',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputProductBrand: {
    height: 40,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 26,
    fontSize: 15,
    width: 390,
  },
  unitContainer: {
    flexDirection: 'row',
    marginBottom: 26,
   // height: 40,
  },
  dosageInput: {
    flex: 1,
    height: 40,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  measurementContainer: {
  //flex: 1,
    flexDirection: 'row',
    marginBottom: 0
  },
  measurementInput: {
   // flex: 1,
    width: 340,
    height: 40,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  measurementButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 5,
    marginLeft: 10,
  },
  frequencyContainer: {
    flexDirection: 'row',
    marginBottom: 26,
  },
  frequencyInput: {
    //flex: 1,
    width: 340,
    height: 40,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  frequencyButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 5,
    marginLeft: 0,
  },
  normalText: {
    fontSize: 15, // Example size
  },
  smallText: {
    fontSize: 14, // Smaller size
  },
  instructionsInput: {
    height: 120,
    borderColor: '#000000',
    color: '#000000',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 26,
    textAlignVertical: 'top',
  },
  dateButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 26,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 380,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000000',
    marginRight: 5,
  },
  medListButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
  },
  medListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', //will be on the left when I choose the week day and the hour/s
    height: 50,
    width: '90%',
    backgroundColor: '#D1FFD1',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  medListButtonTex: {
    fontSize: 22,
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
  },
  calendarText: {
    color: '#000000',
  },
  confirmButton: {
    backgroundColor: '#D1FFD1',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  }, 
  confirmButtonText: {
    color: '#000000',
    fontSize: 16,
  }, 
  modalContent: {
    backgroundColor: '#cccccc',
    borderRadius: 5,
    padding: 30,
    maxHeight: '70%',
  },
  lastModalItem: {
    marginBottom: 100, //line for extra space in the last item of the list
  },    
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#cccccc',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000000',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // background color of the full screen modal
  },
  modalView: {
    backgroundColor: '#cccccc',  // background color of the modal
    borderRadius: 10,  // make the modal a square (no radius)
    padding: 85,  // padding inside the modal
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 185,  // space between the picker and the buttons
  },
  button: {
    backgroundColor: '#D1FFD1',  // button color
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    width: '45%',  // make the buttons take almost half of the modal width (with a small gap between them)
  },
  textStyle: {
    color: '#000000',  // text color
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
