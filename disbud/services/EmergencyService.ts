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
  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // Use cached location if less than 10 seconds old
      });
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  static async sendEmergencyAlert(numbers: string[]): Promise<boolean> {
    try {
      if (!numbers.length) {
        throw new Error('No emergency numbers available');
      }

      // Get location first
      const location = await this.getCurrentLocation();
      const coords = location
        ? `Lat: ${location.coords.latitude}, Long: ${location.coords.longitude}`
        : 'Location unavailable';

      const message = `EMERGENCY: I need immediate assistance! Location: ${coords}`;

      // Send SMS
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        this.makeEmergencyCall(numbers[0]); // Fallback to call if SMS not available
        return false;
      }

      // Send SMS without waiting for user interaction
      SMS.sendSMSAsync(numbers, message).then(() => {
        // After SMS is sent (or attempted), initiate call
        if (Platform.OS === 'android') {
          setTimeout(() => {
            this.makeEmergencyCall(numbers[0]);
          }, 1000);
        }
      });

      return true;
    } catch (error) {
      console.error('Error in emergency alert:', error);
      this.makeEmergencyCall(numbers[0]); // Fallback to call
      return false;
    }
  }

  static async makeEmergencyCall(phoneNumber: string): Promise<void> {
    try {
      const url = `tel:${phoneNumber}`;
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