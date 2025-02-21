import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import { RootStackParamList } from '../types/navigation';
import { EmergencyService } from '../services/EmergencyService';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(false);

  useEffect(() => {
    checkExistingNumbers();
  }, []);

  const checkExistingNumbers = async () => {
    try {
      const numbers = await EmergencyService.getEmergencyNumbers();
      setHasNumbers(!!numbers.primary);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking numbers:', error);
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
        initialRouteName={hasNumbers ? "Home" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF4444',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            title: 'Emergency Contacts',
            headerLeft: () => null // Prevent going back from login
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 