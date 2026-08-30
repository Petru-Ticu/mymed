import React, { useEffect, useState } from 'react';
import { View, Button, Alert, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import AppScreen from './layout/AppScreen';
import { useMedicalList } from './MedicalListContext';
import { medicationsStore } from './userStore';
import { startBluetoothScan } from './BluetoothManager';
import HeartRatePanel from './HeartRatePanel';
import { colors } from './theme/colors';
import {
  formatDoseSentence,
  getRecentDoseEvents,
  getTodayDoseSummary,
  subscribeMedicationHistory,
} from './medicationDoseActions';

const chartWidth = Dimensions.get('window').width - 48;

export default function Myanalytics() {
  const { medicalLists } = useMedicalList();
  const [isConnected, setIsConnected] = useState(false);
  const [heartRateData, setHeartRateData] = useState([]);
  const [today, setToday] = useState(getTodayDoseSummary());
  const [recent, setRecent] = useState(getRecentDoseEvents());

  useEffect(() => {
    console.log('<---------------------------- LOGGING FROM MYANALYTICS.JS -------------------------------->');
    console.log('Current medications:', JSON.stringify(medicationsStore.getAll(), null, 2));
    console.log('<---------------------------- END OF LOGGING FROM MYANALYTICS.JS -------------------------------->');
  }, [medicalLists]);

  useEffect(() => {
    const refresh = () => {
      setToday(getTodayDoseSummary());
      setRecent(getRecentDoseEvents());
    };
    refresh();
    return subscribeMedicationHistory(refresh);
  }, []);

  const handleConnectPress = async () => {
    try {
      const success = await startBluetoothScan((heartRate) => {
        setHeartRateData((prevData) => [...prevData, heartRate]);
      });
      if (success) {
        setIsConnected(true);
      } else {
        Alert.alert('Connection Failed', 'Could not connect to the smartwatch.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const pieData = [
    {
      name: 'Taken',
      population: today.taken,
      color: '#5CA65C',
      legendFontColor: colors.text,
      legendFontSize: 16,
    },
    {
      name: 'Missed',
      population: today.skipped,
      color: '#E53935',
      legendFontColor: colors.text,
      legendFontSize: 16,
    },
  ].filter((slice) => slice.population > 0);

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Your medicine today</Text>
        <Text style={styles.bigNumber}>Taken: {today.taken}</Text>
        <Text style={styles.bigNumber}>Missed: {today.skipped}</Text>

        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={chartWidth}
            height={180}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="16"
            chartConfig={{
              color: () => colors.text,
            }}
            absolute
          />
        ) : (
          <Text style={styles.empty}>No take or skip records yet today.</Text>
        )}

        <Text style={styles.heading}>What you did</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>When you take or skip a medicine, it will show up here.</Text>
        ) : (
          recent.map((event, index) => (
            <View key={`${event.listId}-${event.answeredAt?.iso}-${index}`} style={styles.eventCard}>
              <Text style={styles.eventText}>{formatDoseSentence(event)}</Text>
            </View>
          ))
        )}

        <View style={styles.watchBlock}>
          {!isConnected ? (
            <Button title="Connect to Smartwatch" onPress={handleConnectPress} />
          ) : (
            <HeartRatePanel heartRateData={heartRateData} />
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    paddingTop: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  bigNumber: {
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  empty: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  eventText: {
    fontSize: 18,
    color: colors.text,
  },
  watchBlock: {
    marginTop: 24,
    alignItems: 'center',
  },
});
