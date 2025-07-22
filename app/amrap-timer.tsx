import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Switch, Text, View } from 'react-native';

export default function AMRAPTimerScreen() {
  const router = useRouter();
  const [selectedMinutes, setSelectedMinutes] = useState<number>(20);
  const [selectedSeconds, setSelectedSeconds] = useState<number>(0);
  const [countUp, setCountUp] = useState<boolean>(false);

  // Generate picker items
  const minuteItems = Array.from({ length: 60 }, (_, i) => (
    <Picker.Item key={i + 1} label={`${i + 1}`} value={i + 1} />
  ));
  const secondItems = Array.from({ length: 60 }, (_, i) => (
    <Picker.Item key={i} label={`${i}`} value={i} />
  ));

  const handleStart = () => {
    const totalSeconds = selectedMinutes * 60 + selectedSeconds;
    if (totalSeconds <= 0) {
      Alert.alert('Please select a time greater than 0.');
      return;
    }
    router.push({
      pathname: '/amrap-clock',
      params: {
        minutes: selectedMinutes.toString(),
        seconds: selectedSeconds.toString(),
        countUp: countUp ? '1' : '0',
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AMRAP Timer Setup</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginBottom: 8 }}>Minutes</Text>
          <Picker
            selectedValue={selectedMinutes}
            onValueChange={setSelectedMinutes}
            style={{ width: 100 }}
          >
            {minuteItems}
          </Picker>
        </View>
        <View style={{ width: 16 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginBottom: 8 }}>Seconds</Text>
          <Picker
            selectedValue={selectedSeconds}
            onValueChange={setSelectedSeconds}
            style={{ width: 100 }}
          >
            {secondItems}
          </Picker>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>Count {countUp ? 'Up' : 'Down'}</Text>
        <Switch
          value={countUp}
          onValueChange={setCountUp}
        />
      </View>
      <Button title="Start" onPress={handleStart} />
      <View style={{ height: 24 }} />
      <Button title="Back to Home" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
}); 