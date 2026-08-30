import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    backgroundColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  text: {
    fontSize: 32,
    color: '#000000',
    fontWeight: 'bold',
    margin: 10,
  },
  textSL: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    margin: 10,
  },
  inputContainer: {
    marginTop: 10,
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: '#000000',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  emailProvider: {
    marginTop: 10,
    height: 44,
    width: 300,
    //borderColor: '#ffffff',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providersTexts: {
    fontSize: 15.5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  appleProvider: {
    backgroundColor: 'gray',
    borderColor: 'gray',
  },
  googleProvider: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  microsoftOutlookProvider: {
    backgroundColor: '#0078D4',
    borderColor: '#0078D4',
  },
  yahooProvider: {
    backgroundColor: '#410093',
    borderColor: '#410093',
  },
  textPressable: {
    fontSize: 30,
    color: '#000000'
  },
  pressableWelcome: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  pressableBackground: {
    backgroundColor: '#D1FFD1',
    paddingHorizontal: 75,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 3,
  },
  pressableBackgroundHovered: {
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },
  selectLangBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  }
});


