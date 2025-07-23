import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export const options = {
  headerShown: false,
};

export default function ClockTypeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Clock Type</Text>
      <Text style={styles.message}>This screen will allow you to select different clock types (AMRAP, EMOM, Tabata, etc.) in the future.</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
}); 