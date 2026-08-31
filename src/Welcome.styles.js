import { StyleSheet } from 'react-native';
import { colors } from './theme/colors';
import { layout } from './theme/layout';

export const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 36,
    width: '100%',
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
    width: '100%',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 32,
    color: colors.text,
    fontWeight: 'bold',
    margin: 10,
  },
  textSL: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
    margin: 10,
  },
  inputContainer: {
    marginTop: 10,
    width: '86%',
  },
  languageRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  languageLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    lineHeight: 20,
  },
  continue: {
    width: '100%',
  },
});
