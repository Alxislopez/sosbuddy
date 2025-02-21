import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Linking } from 'react-native';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const contacts = await AsyncStorage.getItem('emergencyContacts');
      if (name) setUserName(name);
      if (contacts) {
        const contactsList = contacts.split(',')
          .map(contact => contact.replace(/[^0-9]/g, ''))
          .filter(contact => contact.length >= 10);
        setEmergencyContacts(contactsList);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load your information');
    }
  };

  const makePhoneCall = async (phoneNumber: string) => {
    try {
      const phoneUrl = Platform.select({
        ios: `telprompt:${phoneNumber}`,
        android: `tel:${phoneNumber}`,
        default: `tel:${phoneNumber}`
      });

      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (!canOpen) {
        throw new Error('Cannot make phone calls');
      }

      await Linking.openURL(phoneUrl);
      return true;
    } catch (error) {
      console.error('Error making phone call:', error);
      Alert.alert('Call Error', 'Could not initiate the phone call. Please try manually.');
      return false;
    }
  };

  const sendSMS = async (numbers: string[], message: string) => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('SMS not available');
      }

      const { result } = await SMS.sendSMSAsync(numbers, message);
      return result === 'sent';
    } catch (error) {
      console.error('SMS error:', error);
      Alert.alert('SMS Error', 'Could not send SMS. Please try manually.');
      return false;
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access is required to share your location in emergency situations.',
          [{ text: 'OK' }]
        );
        return null;
      }

      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Could not get your location. The SMS will be sent without location.');
      return null;
    }
  };

  const sendDistressSignal = async () => {
    if (emergencyContacts.length === 0) {
      Alert.alert('Error', 'No emergency contacts found. Please set up your contacts first.');
      return;
    }

    setIsLoading(true);
    try {
      const location = await getLocation();
      let message = `EMERGENCY: ${userName} needs immediate help!`;
      
      if (location) {
        const { latitude, longitude } = location.coords;
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += ` Current location: ${googleMapsUrl}`;
      }

      // Send SMS first
      await sendSMS(emergencyContacts, message);

      // Then make the call to the first contact
      if (emergencyContacts.length > 0) {
        await makePhoneCall(emergencyContacts[0]);
      }

    } catch (error) {
      console.error('Error in distress signal:', error);
      Alert.alert(
        'Emergency Alert',
        'Could not complete all actions automatically. Would you like to make the call manually?',
        [
          {
            text: 'Yes, Call Now',
            onPress: () => {
              if (emergencyContacts.length > 0) {
                makePhoneCall(emergencyContacts[0]);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {userName}</Text>
      <Text style={styles.instruction}>Press the button below in case of emergency</Text>
      
      <TouchableOpacity
        style={styles.distressButton}
        onPress={sendDistressSignal}
        disabled={isLoading || emergencyContacts.length === 0}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.buttonText}>SEND DISTRESS SIGNAL</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.contactsLabel}>Emergency Contacts:</Text>
      {emergencyContacts.length > 0 ? (
        emergencyContacts.map((contact, index) => (
          <Text key={index} style={styles.contact}>
            {contact} {index === 0 ? '(Primary)' : ''}
          </Text>
        ))
      ) : (
        <Text style={styles.noContacts}>No emergency contacts set up</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  distressButton: {
    backgroundColor: '#ff0000',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  contactsLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  contact: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  noContacts: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
}); 