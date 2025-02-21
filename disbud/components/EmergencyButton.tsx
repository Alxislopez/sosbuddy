import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface EmergencyButtonProps {
  onPress: () => void;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>
        SEND DISTRESS{'\n'}SIGNAL
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EmergencyButton; 