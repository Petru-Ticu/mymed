import { StyleSheet } from 'react-native';
import { colors } from './theme/colors';

export const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  today: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 20,
    lineHeight: 28,
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.text,
    padding: 22,
  },
  emptyText: {
    fontSize: 22,
    color: colors.text,
    lineHeight: 32,
  },
  emptyAction: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.text,
    padding: 18,
    marginBottom: 14,
    minHeight: 96,
  },
  cardDue: {
    backgroundColor: '#FFE8E8',
  },
  cardUpcoming: {
    backgroundColor: colors.accent,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  time: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  take: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 28,
  },
  countdown: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
  },
  hint: {
    fontSize: 18,
    color: colors.text,
    marginTop: 12,
  },
});
