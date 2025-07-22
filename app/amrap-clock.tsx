import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function AMRAPClockScreen() {
  const router = useRouter();
  const { minutes = '20', seconds = '0', countUp = '0' } = useLocalSearchParams();
  const totalSeconds = parseInt(minutes as string) * 60 + parseInt(seconds as string);
  const isCountUp = countUp === '1';

  const [timerSeconds, setTimerSeconds] = useState(isCountUp ? 0 : totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  // Start countdown on first tap
  const handleFirstTap = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setShowCountdown(true);
      setCountdown(10);
      setIsRunning(false);
      setTimerSeconds(isCountUp ? 0 : totalSeconds);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(countdownRef.current);
            setShowCountdown(false);
            setIsRunning(true);
            return 0;
          }
        });
      }, 1000);
    } else if (!showCountdown) {
      setIsRunning((prev) => !prev);
    }
  };

  // Timer logic
  useEffect(() => {
    if (showCountdown || !hasStarted) return;
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (isCountUp) {
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
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, showCountdown, isCountUp, totalSeconds, hasStarted]);

  // Format time for display
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <TouchableWithoutFeedback onPress={handleFirstTap}>
      <View style={styles.fullScreen}>
        <View style={styles.topRight}>
          <Button title="Back" onPress={() => router.back()} />
        </View>
        {!hasStarted ? (
          <Text style={styles.countdownText}>Tap to start countdown</Text>
        ) : showCountdown ? (
          <Text style={styles.countdownText}>{countdown > 0 ? countdown : 'GO!'}</Text>
        ) : (
          <Text style={styles.clockText}>{formatted}</Text>
        )}
        {hasStarted && !showCountdown && (
          <Text style={styles.tapHint}>(Tap anywhere to {isRunning ? 'pause' : 'start'})</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockText: {
    color: '#fff',
    fontSize: 96,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdownText: {
    color: '#FFD700',
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tapHint: {
    color: '#aaa',
    fontSize: 18,
    marginTop: 32,
    textAlign: 'center',
  },
  topRight: {
    position: 'absolute',
    top: 48,
    right: 24,
  },
}); 