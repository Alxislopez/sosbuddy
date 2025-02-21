import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreenNavigationProp, RootStackParamList } from '../types/navigation';
import { RouteProp } from '@react-navigation/native';
import { EmergencyService } from '../services/EmergencyService';

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'Login'>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const [primaryNumber, setPrimaryNumber] = useState('');
  const [secondaryNumber, setSecondaryNumber] = useState('');
  const isEditMode = route.params?.mode === 'edit';

  useEffect(() => {
    if (isEditMode) {
      loadSavedNumbers();
    }
  }, [isEditMode]);

  const loadSavedNumbers = async () => {
    try {
      const numbers = await EmergencyService.getEmergencyNumbers();
      setPrimaryNumber(numbers.primary);
      setSecondaryNumber(numbers.secondary);
    } catch (error) {
      console.error('Error loading numbers:', error);
    }
  };

  const saveNumbers = async () => {
    if (!primaryNumber) {
      Alert.alert('Error', 'Please enter at least the primary number');
      return;
    }

    try {
      await EmergencyService.saveEmergencyNumbers(primaryNumber, secondaryNumber);
      Alert.alert('Success', 'Emergency numbers saved successfully');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save numbers');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts Setup</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter Primary Emergency Number"
        value={primaryNumber}
        onChangeText={setPrimaryNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Secondary Emergency Number (Optional)"
        value={secondaryNumber}
        onChangeText={setSecondaryNumber}
        keyboardType="phone-pad"
      />

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={saveNumbers}
      >
        <Text style={styles.saveButtonText}>Save Numbers</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 