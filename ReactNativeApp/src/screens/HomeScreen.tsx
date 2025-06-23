import React from 'react';
import { Text, TouchableOpacity,StyleSheet, View } from 'react-native';
import AppLayout from '../components/AppLayout';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  UploadRecipe: undefined;
  UploadFromWeb: undefined;
  ShowRecipe: undefined;
  Login: undefined;
  Register: undefined;
};

export default function HomeScreen({}: any) {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleAddPress = () => {
    navigation.navigate('UploadRecipe'); 
  };

  return (
    <AppLayout>
      <Text>🏠 Home Screen</Text>
      <View style={styles.container}>
  <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
    <Text style={styles.addButtonText}>+</Text>
  </TouchableOpacity>
</View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',  // centers vertically
    alignItems: 'center',      // centers horizontally

  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonText: {
    color: 'red',
    fontSize: 60,
    fontWeight: 'bold',
    lineHeight: 64,
    marginTop: -4,
  },
});
