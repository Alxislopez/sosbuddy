import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { EmergencyService } from '../services/EmergencyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSound();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadUserData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('userName');
      const savedNumbers = await AsyncStorage.getItem('phoneNumbers');
      
      if (savedName) setName(savedName);
      if (savedNumbers) setPhoneNumbers(JSON.parse(savedNumbers));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3'),
        { isLooping: true }
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const playAlarm = async () => {
    try {
      if (!soundRef.current) {
        await loadSound();
      }
      
      // Set audio mode for better playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await soundRef.current?.playAsync();
      setIsAlarmActive(true);
    } catch (error) {
      console.error('Error playing alarm:', error);
      Alert.alert('Error', 'Failed to play alarm sound');
    }
  };

  const stopAlarm = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        setIsAlarmActive(false);
      }
    } catch (error) {
      console.error('Error stopping alarm:', error);
      Alert.alert('Error', 'Failed to stop alarm sound');
    }
  };

  const handleEmergency = async () => {
    if (isDisabled) return;
    
    if (!name || !phoneNumbers.length) {
      Alert.alert('Error', 'Please set up your emergency contacts first');
      navigation.replace('Login');
      return;
    }

    setIsDisabled(true);

    try {
      // Start alarm
      await playAlarm();

      // Send emergency alert with location and make call
      await EmergencyService.sendEmergencyAlert(name.trim(), phoneNumbers);

      // Navigate to details screen
      navigation.navigate('Details', { 
        itemId: 1,
        name: name.trim(),
        phoneNumbers: phoneNumbers,
        soundRef: soundRef.current
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
    } finally {
      setTimeout(() => {
        setIsDisabled(false);
      }, 500);
    }
  };

  const handleEditInfo = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {name}</Text>
      <Text style={styles.subtitle}>Emergency Contacts: {phoneNumbers.length}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.emergencyButton, isDisabled && styles.buttonDisabled]}
          onPress={handleEmergency}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>SEND DISTRESS SIGNAL</Text>
        </TouchableOpacity>

        {isAlarmActive && (
          <TouchableOpacity
            style={styles.stopAlarmButton}
            onPress={stopAlarm}
          >
            <Text style={styles.buttonText}>STOP ALARM</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditInfo}
        >
          <Text style={styles.editButtonText}>Edit Emergency Contacts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  emergencyButton: {
    backgroundColor: '#FF4444',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopAlarmButton: {
    backgroundColor: '#cc0000',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF4444',
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
}); 