import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Login: { mode?: 'edit' } | undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>; 