import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { RootStackParamList } from '../types/navigation';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Details'>;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

export default function DetailScreen({ route, navigation }: Props) {
  const { name, phoneNumbers, soundRef } = route.params;

  const handleReturn = async () => {
    // Stop the alarm if it exists
    if (soundRef) {
      try {
        await soundRef.stopAsync();
        await soundRef.unloadAsync();
      } catch (error) {
        console.log('Error stopping alarm:', error);
      }
    }
    // Navigate back to home
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Distress Signal Sent</Text>
        <Text style={styles.subtitle}>Emergency Contact Details:</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.text}>{name}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Contact Numbers:</Text>
          {phoneNumbers.map((number, index) => (
            <Text key={index} style={styles.text}>
              {index + 1}. {number}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={styles.returnButton}
          onPress={handleReturn}
        >
          <Text style={styles.returnButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  returnButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  returnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 