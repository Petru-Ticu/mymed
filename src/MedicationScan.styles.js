import { StyleSheet } from 'react-native';
import { colors } from './theme/colors';
import { layout } from './theme/layout';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeHeader: {
    backgroundColor: colors.accent,
  },
  header: {
    height: layout.headerInnerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.accent,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginRight: 36,
  },
  body: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  why: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 20,
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actions: {
    marginTop: 8,
  },
  actionSpace: {
    marginTop: 12,
  },
});
