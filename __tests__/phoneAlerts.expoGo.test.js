jest.mock('../src/utils/runtime', () => ({
  runningInExpoGo: () => true,
}));

jest.mock('expo-notifications', () => {
  throw new Error('expo-notifications should not load in Expo Go');
});

const { notifyInventoryOnPhone, syncScheduledDoseAlerts } = require('../src/phoneAlerts');

test('skips OS notification APIs in Expo Go', async () => {
  await expect(syncScheduledDoseAlerts([])).resolves.toBeUndefined();
  await expect(notifyInventoryOnPhone({
    level: 'empty',
    name: 'Aspirin',
  })).resolves.toBeUndefined();
});
