import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import Communications from 'react-native-communications';

interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
  };
}

export const EmergencyService = {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location access is required for emergency services');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  },

  async sendEmergencyAlert(name: string, numbers: string[]): Promise<boolean> {
    try {
      if (!numbers.length) {
        throw new Error('No emergency numbers available');
      }

      // Get location
      const location = await this.getCurrentLocation();
      const googleMapsUrl = location 
        ? `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`
        : 'Location unavailable';

      const message = `EMERGENCY: ${name} needs immediate assistance!\n\nCurrent Location: ${googleMapsUrl}\n\nThis is an automated emergency alert.`;

      if (Platform.OS === 'android') {
        // Send SMS to all numbers
        for (const number of numbers) {
          Communications.textWithoutEncoding(number, message);
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between messages
        }

        // Make emergency call to first number after sending SMS
        setTimeout(() => {
          this.makeEmergencyCall(numbers[0]);
        }, 1000);
      } else {
        // For iOS, use Linking
        const smsUrl = `sms:${numbers.join(',')}&body=${encodeURIComponent(message)}`;
        await Linking.openURL(smsUrl);
        
        // Make emergency call after a short delay
        setTimeout(() => {
          this.makeEmergencyCall(numbers[0]);
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error('Error in emergency alert:', error);
      // Fallback to call if SMS fails
      this.makeEmergencyCall(numbers[0]);
      return false;
    }
  },

  async makeEmergencyCall(phoneNumber: string): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        Communications.phonecall(phoneNumber, true);
      } else {
        const telUrl = `tel:${phoneNumber}`;
        const canOpen = await Linking.canOpenURL(telUrl);
        if (canOpen) {
          await Linking.openURL(telUrl);
        } else {
          Alert.alert('Error', 'Cannot make phone calls from this device');
        }
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to initiate emergency call');
    }
  },

  async saveEmergencyNumbers(primary: string, secondary: string[]): Promise<boolean> {
    // Mock implementation for now
    return true;
  },

  async getEmergencyNumbers() {
    // Mock implementation for now
    return {
      primary: '',
      secondary: []
    };
  }
}; 