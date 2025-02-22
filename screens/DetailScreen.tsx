import { StyleSheet, View, Text } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Details: { itemId: number };
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Details'>;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

export default function DetailScreen({ route }: Props) {
  const { itemId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text style={styles.text}>Item ID: {itemId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
}); 