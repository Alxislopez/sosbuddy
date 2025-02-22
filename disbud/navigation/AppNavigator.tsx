import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import DetailScreen from './DetailScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserData, setHasUserData] = useState(false);

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName');
      setHasUserData(!!userName);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking user data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF4444" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasUserData ? "Home" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF4444',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            title: 'Setup',
            headerLeft: () => null // Prevent back navigation
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Emergency Contact',
            headerLeft: () => null // Prevent back navigation
          }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailScreen}
          options={{ 
            title: 'Distress Signal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 