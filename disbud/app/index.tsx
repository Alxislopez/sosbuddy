// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName');
      const contacts = await AsyncStorage.getItem('emergencyContacts');

      if (userName && contacts) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      router.replace('/login');
    }
  };

  return null;
}
