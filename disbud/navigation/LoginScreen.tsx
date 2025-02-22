import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(['']);

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const updatePhoneNumber = (text: string, index: number) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = text;
    setPhoneNumbers(newPhoneNumbers);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhoneNumbers);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    const validPhoneNumbers = phoneNumbers.filter(num => num.trim().length > 0);
    if (validPhoneNumbers.length === 0) {
      Alert.alert('Error', 'Please enter at least one phone number');
      return;
    }

    try {
      // Save user data
      await AsyncStorage.setItem('userName', name.trim());
      await AsyncStorage.setItem('phoneNumbers', JSON.stringify(validPhoneNumbers));

      // Navigate to Home
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save information');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Emergency Contact Setup</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Emergency Contact Numbers</Text>
          {phoneNumbers.map((phoneNumber, index) => (
            <View key={index} style={styles.phoneInputContainer}>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={(text) => updatePhoneNumber(text, index)}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
              {phoneNumbers.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoneNumber(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={addPhoneNumber}
          >
            <Text style={styles.addButtonText}>+ Add Another Number</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save and Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FF4444',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  removeButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 