import React, { useCallback, useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from './i18n';
import { colors } from './theme/colors';
import { layout } from './theme/layout';
import { parseScannedMedication } from './utils/parseScannedMedication';
import AppButton from './ui/AppButton';
import { styles } from './MedicationScan.styles';

const BARCODE_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'codabar',
  'datamatrix',
  'pdf417',
  'aztec',
  'itf14',
];

export default function MedicationScan({ navigation, route }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [asked, setAsked] = useState(false);
  const [scanned, setScanned] = useState(false);

  const fromTyping = Boolean(route.params?.fromTyping);

  const goBackOrType = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.replace('MedicationTypingPage', { mode: 'create' });
  };

  const applyScan = useCallback((scanFill) => {
    if (fromTyping) {
      navigation.navigate({
        name: 'MedicationTypingPage',
        params: { scanFill, scanFillAt: Date.now() },
        merge: true,
      });
      return;
    }
    navigation.replace('MedicationTypingPage', { mode: 'create', scanFill });
  }, [fromTyping, navigation]);

  const onBarcodeScanned = useCallback(({ data }) => {
    if (scanned || !data) {
      return;
    }
    setScanned(true);
    applyScan(parseScannedMedication(data));
  }, [applyScan, scanned]);

  const onAllow = async () => {
    setAsked(true);
    await requestPermission();
  };

  const header = (
    <View style={[styles.safeHeader, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBackOrType}
          accessibilityRole="button"
          accessibilityLabel={t('language.back')}
          hitSlop={{ top: layout.hitSlop, bottom: layout.hitSlop, left: layout.hitSlop, right: layout.hitSlop }}
        >
          <MaterialIcons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('scan.title')}</Text>
      </View>
    </View>
  );

  if (!permission) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.body}>
          <Text style={styles.why}>{t('scan.why')}</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    const deniedForGood = asked && permission.canAskAgain === false;
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.body}>
          <Text style={styles.why}>{deniedForGood ? t('scan.denied') : t('scan.why')}</Text>
          <View style={styles.actions}>
            {deniedForGood ? (
              <AppButton label={t('scan.openSettings')} onPress={() => Linking.openSettings()} />
            ) : (
              <AppButton label={t('scan.allow')} onPress={onAllow} />
            )}
            <AppButton
              style={styles.actionSpace}
              label={deniedForGood ? t('scan.typeInstead') : t('scan.notNow')}
              variant="secondary"
              onPress={goBackOrType}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {header}
      <View style={styles.camera}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
          onMountError={() => setAsked(true)}
        />
        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>{t('scan.point')}</Text>
        </View>
      </View>
    </View>
  );
}
