import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState('');

  const handleSetup = async () => {
    if (name.trim() && emergencyContacts.trim()) {
      try {
        // Clean and validate phone numbers
        const cleanNumbers = emergencyContacts
          .split(',')
          .map(num => num.replace(/[^0-9]/g, ''))
          .filter(num => num.length >= 10)
          .join(',');

        if (!cleanNumbers) {
          Alert.alert(
            'Invalid Numbers',
            'Please enter valid phone numbers with at least 10 digits'
          );
          return;
        }

        await AsyncStorage.setItem('userName', name.trim());
        await AsyncStorage.setItem('emergencyContacts', cleanNumbers);
        router.replace('/home');
      } catch (error) {
        console.error('Error saving data:', error);
        Alert.alert('Error', 'Failed to save your information. Please try again.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Emergency Contact Setup</Text>
      
      <Text style={styles.label}>Your Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoFocus
      />

      <Text style={styles.label}>Emergency Contact Numbers:</Text>
      <TextInput
        style={styles.input}
        value={emergencyContacts}
        onChangeText={setEmergencyContacts}
        placeholder="Enter phone numbers (comma separated)"
        keyboardType="phone-pad"
      />
      <Text style={styles.hint}>
        Enter emergency contact numbers separated by commas{'\n'}
        Example: 1234567890,0987654321
      </Text>

      <Button 
        title="Save & Continue" 
        onPress={handleSetup}
        disabled={!name.trim() || !emergencyContacts.trim()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
}); 