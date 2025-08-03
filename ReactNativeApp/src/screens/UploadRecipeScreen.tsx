import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import AppLayout from '../components/AppLayout';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; 
type RootStackParamList = {
  Home: undefined;
  UploadFromWeb: undefined;
  Login: undefined;
  Register: undefined;
};
export default function UploadRecipeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Navigates to the screen where user can paste a recipe URL
  const handleUploadFromWeb = () => {
    navigation.navigate('UploadFromWeb');
  };

  return (
    <AppLayout>
      {/* Top button that leads to web-based upload */}
      <View style={styles.topButtonContainer}>
        <TouchableOpacity style={styles.webButton} onPress={handleUploadFromWeb}>
          <Ionicons name="globe-outline" size={20} color="#333" />
          <Text style={styles.webButtonText}>Upload From Web</Text>
        </TouchableOpacity>
      </View>

{/* Placeholder for future upload options or content */}
      <View style={styles.container}>
        <Text>Upload Recipe</Text>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  topButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  webButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 3,
  },
  webButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',     
  },
});
