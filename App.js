import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useRef, useState } from 'react';
import { Button, Picker, StyleSheet, Switch, Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WodClock</Text>
      <Button
        title="AMRAP Timer"
        onPress={() => navigation.navigate('AMRAPTimer')}
      />
    </View>
  );
}

function AMRAPTimerScreen({ navigation }) {
  const [selectedMinutes, setSelectedMinutes] = useState(20);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [countUp, setCountUp] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Calculate total seconds for timer
  const totalSeconds = isCustom && customMinutes ? parseInt(customMinutes) * 60 : selectedMinutes * 60;

  // Timer logic
  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (countUp) {
            if (prev < totalSeconds) {
              return prev + 1;
            } else {
              clearInterval(intervalRef.current);
              setIsRunning(false);
              return prev;
            }
          } else {
            if (prev > 0) {
              return prev - 1;
            } else {
              clearInterval(intervalRef.current);
              setIsRunning(false);
              return 0;
            }
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, countUp, totalSeconds]);

  // Start timer
  const handleStart = () => {
    if (!isRunning) {
      if (countUp) {
        setSeconds((s) => (s === totalSeconds ? 0 : s));
      } else {
        setSeconds((s) => (s === 0 ? totalSeconds : s));
      }
      setIsRunning(true);
    }
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(countUp ? 0 : totalSeconds);
  };

  // Format time for display
  const displaySeconds = countUp ? seconds : seconds;
  const mins = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // When switching modes or time, reset timer
  React.useEffect(() => {
    setIsRunning(false);
    setSeconds(countUp ? 0 : totalSeconds);
  }, [countUp, totalSeconds]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AMRAP Timer</Text>
      <View style={{ marginBottom: 16, width: '80%' }}>
        <Text style={{ fontSize: 18, marginBottom: 8 }}>Select Time (minutes):</Text>
        <Picker
          selectedValue={isCustom ? 'custom' : selectedMinutes}
          onValueChange={(itemValue) => {
            if (itemValue === 'custom') {
              setIsCustom(true);
            } else {
              setIsCustom(false);
              setSelectedMinutes(itemValue);
            }
          }}
          style={{ width: '100%' }}
        >
          <Picker.Item label="5" value={5} />
          <Picker.Item label="10" value={10} />
          <Picker.Item label="15" value={15} />
          <Picker.Item label="20" value={20} />
          <Picker.Item label="Custom" value="custom" />
        </Picker>
        {isCustom && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ marginRight: 8 }}>Custom:</Text>
            <input
              type="number"
              min="1"
              max="120"
              value={customMinutes}
              onChange={e => setCustomMinutes(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: 60, fontSize: 16, padding: 4 }}
            />
            <Text style={{ marginLeft: 8 }}>min</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>Count {countUp ? 'Up' : 'Down'}</Text>
        <Switch
          value={countUp}
          onValueChange={setCountUp}
        />
      </View>
      <Text style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 24 }}>{formatted}</Text>
      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <Button title={isRunning ? "Pause" : "Start"} onPress={isRunning ? handlePause : handleStart} />
        <View style={{ width: 16 }} />
        <Button title="Reset" onPress={handleReset} />
      </View>
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AMRAPTimer" component={AMRAPTimerScreen} options={{ title: 'AMRAP Timer' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 