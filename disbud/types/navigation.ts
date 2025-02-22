import { StackNavigationProp } from '@react-navigation/stack';
import { Audio } from 'expo-av';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Details: {
    itemId: number;
    name: string;
    phoneNumbers: string[];
    soundRef: Audio.Sound | null;
  };
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>; 