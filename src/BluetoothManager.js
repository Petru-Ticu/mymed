import { PermissionsAndroid, Platform, Alert, NativeModules } from 'react-native';
import { t } from './i18n';

let manager = null;

function getBleManager() {
  if (manager) {
    return manager;
  }
  if (!NativeModules.BlePlx) {
    return null;
  }
  try {
    const { BleManager } = require('react-native-ble-plx');
    manager = new BleManager();
  } catch (error) {
    return null;
  }
  return manager;
}

export const startBluetoothScan = async (onHeartRateUpdate) => {
  const bleManager = getBleManager();
  if (!bleManager) {
    Alert.alert(
      t('ble.unavailableTitle'),
      t('ble.unavailableBody')
    );
    return false;
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: t('ble.locationTitle'),
        message: t('ble.locationBody'),
        buttonNeutral: t('ble.askLater'),
        buttonNegative: t('ble.cancel'),
        buttonPositive: t('ble.ok'),
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert(t('ble.permissionDeniedTitle'), t('ble.permissionDeniedBody'));
      return false;
    }
  } else if (Platform.OS === 'ios') {
    bleManager.onStateChange((state) => {
      if (state !== 'PoweredOn') {
        Alert.alert(t('ble.bluetoothOffTitle'), t('ble.bluetoothOffBody'));
        return false;
      }
    }, true);
  }

  return new Promise((resolve, reject) => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        reject(error);
        return;
      }

      if (device.name && device.name.includes('Smartwatch')) {
        bleManager.stopDeviceScan();
        bleManager.connectToDevice(device.id)
          .then((connectedDevice) => {
            return connectedDevice.discoverAllServicesAndCharacteristics();
          })
          .then((connectedDevice) => {
            const heartRateServiceUUID = '180D';
            const heartRateCharacteristicUUID = '2A37';

            connectedDevice.monitorCharacteristicForService(
              heartRateServiceUUID,
              heartRateCharacteristicUUID,
              (error, characteristic) => {
                if (error) {
                  // console.log('Error reading heart rate:', error.message);
                  return;
                }

                const heartRate = parseHeartRate(characteristic.value);
                onHeartRateUpdate(heartRate);
              }
            );

            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      resolve(false);
    }, 10000);
  });
};

const parseHeartRate = (value) => {
  const data = Buffer.from(value, 'base64');
  return data.readUInt8(1);
};
