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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 18,
    lineHeight: 28,
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.text,
    padding: 18,
    marginBottom: 16,
    minHeight: 96,
  },
  cardDue: {
    backgroundColor: '#FFE8E8',
  },
  cardUpcoming: {
    backgroundColor: colors.accent,
  },
  cardApproaching: {
    backgroundColor: '#FFF4D6',
  },
  cardEmpty: {
    backgroundColor: '#FFE8E8',
  },
  cardLow: {
    backgroundColor: '#FFE4C4',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 28,
  },
  cardHint: {
    fontSize: 18,
    color: colors.text,
    marginTop: 12,
  },
});
