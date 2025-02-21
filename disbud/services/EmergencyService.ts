import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
  };
}

export class EmergencyService {
  static async requestLocationPermission(): Promise<LocationData | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is needed to send your location in emergency.'
        );
        return null;
      }
      return await Location.getCurrentPositionAsync({});
    } catch (error) {
      console.error('Error requesting location:', error);
      return null;
    }
  }

  static async sendSMS(phoneNumbers: string[], message: string): Promise<boolean> {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Error',
          'SMS is not available on this device. Please try calling instead.'
        );
        return false;
      }

      const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
      if (result === 'sent') {
        Alert.alert('Success', 'Emergency message sent successfully');
        return true;
      } else {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      Alert.alert(
        'Error',
        'Failed to send emergency message. Please try calling directly.'
      );
      return false;
    }
  }

  static async makeEmergencyCall(phoneNumber: string): Promise<void> {
    try {
      const url = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (!canOpen) {
        Alert.alert('Error', 'Unable to make phone calls from this device');
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to initiate emergency call');
    }
  }

  static async saveEmergencyNumbers(primary: string, secondary?: string): Promise<void> {
    try {
      if (!primary) {
        throw new Error('Primary number is required');
      }
      await AsyncStorage.setItem('primaryNumber', primary);
      if (secondary) {
        await AsyncStorage.setItem('secondaryNumber', secondary);
      } else {
        await AsyncStorage.removeItem('secondaryNumber');
      }
    } catch (error) {
      console.error('Error saving numbers:', error);
      throw error;
    }
  }

  static async getEmergencyNumbers(): Promise<{ primary: string; secondary: string }> {
    try {
      const primary = await AsyncStorage.getItem('primaryNumber') || '';
      const secondary = await AsyncStorage.getItem('secondaryNumber') || '';
      return { primary, secondary };
    } catch (error) {
      console.error('Error getting numbers:', error);
      return { primary: '', secondary: '' };
    }
  }
} 