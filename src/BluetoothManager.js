import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert, NativeModules } from 'react-native';

let manager = null;

function getBleManager() {
  if (manager) {
    return manager;
  }
  if (!NativeModules.BlePlx) {
    return null;
  }
  try {
    manager = new BleManager();
  } catch (error) {
    console.log('Error creating BLE manager:', error.message);
    return null;
  }
  return manager;
}

export const startBluetoothScan = async (onHeartRateUpdate) => {
  const bleManager = getBleManager();
  if (!bleManager) {
    Alert.alert(
      'Bluetooth not available',
      'Heart rate needs a development build. Expo Go does not include the BLE native module.'
    );
    return false;
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs location permission to scan for Bluetooth devices.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Permission Denied', 'Location permission is required to scan for Bluetooth devices.');
      return false;
    }
  } else if (Platform.OS === 'ios') {
    bleManager.onStateChange((state) => {
      if (state !== 'PoweredOn') {
        Alert.alert('Bluetooth is off', 'Please enable Bluetooth to connect to your smartwatch.');
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
                  console.log('Error reading heart rate:', error.message);
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
