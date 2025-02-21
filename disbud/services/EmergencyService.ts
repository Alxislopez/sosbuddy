import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import Communications from 'react-native-communications';

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

      if (Platform.OS === 'android') {
        // Use Communications for Android
        Communications.textWithoutEncoding(numbers[0], message);
        
        // If there's a secondary number, send to that too
        if (numbers.length > 1) {
          setTimeout(() => {
            Communications.textWithoutEncoding(numbers[1], message);
          }, 500);
        }

        // After a short delay, initiate call
        setTimeout(() => {
          this.makeEmergencyCall(numbers[0]);
        }, 1500);
        
        return true;
      } else {
        // For iOS, use Linking
        const smsUrl = `sms:${numbers.join(',')}&body=${encodeURIComponent(message)}`;
        await Linking.openURL(smsUrl);
        return true;
      }
    } catch (error) {
      console.error('Error in emergency alert:', error);
      // Fallback to call if SMS fails
      this.makeEmergencyCall(numbers[0]);
      return false;
    }
  }

  static async makeEmergencyCall(phoneNumber: string): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        Communications.phonecall(phoneNumber, true);
      } else {
        // For iOS, show confirmation dialog
        Alert.alert(
          'Emergency Call',
          'Do you want to call emergency contact?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call',
              style: 'destructive',
              onPress: () => Communications.phonecall(phoneNumber, true)
            }
          ]
        );
      }
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