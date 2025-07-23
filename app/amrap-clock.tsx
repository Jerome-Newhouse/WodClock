import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Button, StyleSheet, Text, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const options = {
  headerShown: false,
};

export default function AMRAPClockScreen() {
  const router = useRouter();
  const { minutes = '20', seconds = '0', countUp = '0' } = useLocalSearchParams();
  const totalSeconds = parseInt(minutes as string) * 60 + parseInt(seconds as string);
  const isCountUp = countUp === '1';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [timerSeconds, setTimerSeconds] = useState(isCountUp ? 0 : totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);
  const animatedCountdown = useRef(new Animated.Value(1)).current; // 1 to 0
  const animatedTimer = useRef(new Animated.Value(isCountUp ? 0 : 1)).current; // 0 to 1 (countUp), 1 to 0 (countDown)

  // Start countdown on first tap or stop it if already counting down
  const handleFirstTap = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setShowCountdown(true);
      setCountdown(10);
      setIsRunning(false);
      setTimerSeconds(isCountUp ? 0 : totalSeconds);
      animatedCountdown.setValue(1);
      Animated.timing(animatedCountdown, {
        toValue: 0,
        duration: 10000,
        useNativeDriver: false,
      }).start();
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(countdownRef.current);
            setShowCountdown(false);
            setIsRunning(true);
            // Start timer animation
            animatedTimer.setValue(isCountUp ? 0 : 1);
            Animated.timing(animatedTimer, {
              toValue: isCountUp ? 1 : 0,
              duration: totalSeconds * 1000,
              useNativeDriver: false,
            }).start();
            return 0;
          }
        });
      }, 1000);
    } else if (showCountdown) {
      // Stop/cancel the countdown and reset
      clearInterval(countdownRef.current);
      animatedCountdown.stopAnimation();
      animatedTimer.stopAnimation();
      setHasStarted(false);
      setShowCountdown(false);
      setCountdown(10);
      setIsRunning(false);
      setTimerSeconds(isCountUp ? 0 : totalSeconds);
    } else {
      setIsRunning((prev) => {
        const next = !prev;
        if (next) {
          // Resume timer animation
          const currentProgress = isCountUp
            ? timerSeconds / totalSeconds
            : (totalSeconds - timerSeconds) / totalSeconds;
          const remaining = isCountUp
            ? (1 - currentProgress) * totalSeconds * 1000
            : currentProgress * totalSeconds * 1000;
          Animated.timing(animatedTimer, {
            toValue: isCountUp ? 1 : 0,
            duration: remaining,
            useNativeDriver: false,
          }).start();
        } else {
          animatedTimer.stopAnimation();
        }
        return next;
      });
    }
  };

  // Handler for restart button
  const handleRestart = () => {
    clearInterval(countdownRef.current);
    clearInterval(intervalRef.current);
    animatedCountdown.stopAnimation();
    animatedTimer.stopAnimation();
    setHasStarted(false);
    setShowCountdown(false);
    setCountdown(10);
    setIsRunning(false);
    setTimerSeconds(isCountUp ? 0 : totalSeconds);
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

  // Responsive font sizes
  const clockFontSize = isLandscape ? Math.floor(width * 0.18) : 96;
  const countdownFontSize = isLandscape ? Math.floor(width * 0.13) : 72;
  const tapHintFontSize = isLandscape ? 24 : 18;
  const rotateStyle = isLandscape ? { transform: [{ rotate: '-90deg' }] } : {};

  // Circle countdown progress
  const CIRCLE_SIZE = isLandscape ? Math.floor(height * 0.85) : Math.floor(width * 0.85);
  const STROKE_WIDTH = 12;
  const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const animatedCountdownStrokeDashoffset = animatedCountdown.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });
  const animatedTimerStrokeDashoffset = animatedTimer.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <TouchableWithoutFeedback onPress={handleFirstTap}>
      <View style={styles.fullScreen}>
        <View style={styles.backButton}>
          <Button
            title="Back"
            onPress={() => router.back()}
            color="#fff"
          />
        </View>
        <View style={styles.changeClockButton}>
          <Button
            title="Change Clock Type"
            onPress={() => router.push({ pathname: '/clock-type' })}
            color="#fff"
          />
        </View>
        {showCountdown && (
          <View style={{ justifyContent: 'center', alignItems: 'center', ...StyleSheet.absoluteFillObject }} pointerEvents="none">
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="#FFD700"
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={animatedCountdownStrokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        )}
        {!showCountdown && hasStarted && (
          <View style={{ justifyContent: 'center', alignItems: 'center', ...StyleSheet.absoluteFillObject }} pointerEvents="none">
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="#FFD700"
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={animatedTimerStrokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        )}
        {!hasStarted ? (
          <Text style={[styles.countdownText, { fontSize: countdownFontSize, color: '#FF0000' }, rotateStyle]}>Tap to start countdown</Text>
        ) : showCountdown ? (
          <Text style={[styles.countdownText, { fontSize: countdownFontSize }, rotateStyle]}>{countdown > 0 ? countdown : 'GO!'}</Text>
        ) : (
          <Text style={[styles.clockText, { fontSize: clockFontSize }, rotateStyle]}>{formatted}</Text>
        )}
        {hasStarted && !showCountdown && (
          <Text style={[styles.tapHint, { fontSize: tapHintFontSize }, rotateStyle]}>(Tap anywhere to {isRunning ? 'pause' : 'start'})</Text>
        )}
        <View style={styles.restartButton}>
          <Button title="Restart" onPress={handleRestart} color="#fff" />
        </View>
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
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
  },
  changeClockButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
  },
  clockText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdownText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tapHint: {
    color: '#aaa',
    marginTop: 32,
    textAlign: 'center',
  },
  restartButton: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
}); 