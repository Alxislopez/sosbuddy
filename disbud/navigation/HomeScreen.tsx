import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmergencyButton from '../components/EmergencyButton';
import { EmergencyService, LocationData } from '../services/EmergencyService';
import ActionButton from '../components/ActionButton';
import { HomeScreenNavigationProp } from '../types/navigation';

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [emergencyNumbers, setEmergencyNumbers] = useState({ primary: '', secondary: '' });

  useEffect(() => {
    loadEmergencyNumbers();
  }, []);

  const loadEmergencyNumbers = async () => {
    const numbers = await EmergencyService.getEmergencyNumbers();
    if (!numbers.primary) {
      navigation.replace('Login');
      return;
    }
    setEmergencyNumbers(numbers);
  };

  const handleEmergency = async () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send a distress signal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'YES',
          onPress: async () => {
            const numbers = [emergencyNumbers.primary];
            if (emergencyNumbers.secondary) {
              numbers.push(emergencyNumbers.secondary);
            }

            if (numbers.length === 0) {
              Alert.alert('Error', 'No emergency numbers saved');
              return;
            }

            try {
              await EmergencyService.sendEmergencyAlert(numbers);
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Failed to send emergency alert');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, alexis</Text>
      
      <Text style={styles.instructionText}>
        Press the button below in case of emergency
      </Text>

      <EmergencyButton onPress={handleEmergency} />

      <View style={styles.contactsContainer}>
        <Text style={styles.contactsTitle}>Emergency Contacts:</Text>
        {emergencyNumbers.primary && (
          <Text style={styles.contactText}>{emergencyNumbers.primary} (Primary)</Text>
        )}
        {emergencyNumbers.secondary && (
          <Text style={styles.contactText}>{emergencyNumbers.secondary}</Text>
        )}
      </View>

      <View style={styles.bottomButtons}>
        <ActionButton
          title="Change Emergency Numbers"
          onPress={() => navigation.navigate('Login', { mode: 'edit' })}
        />
        <ActionButton
          title="Return to Login"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  contactsContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});

export default HomeScreen; 