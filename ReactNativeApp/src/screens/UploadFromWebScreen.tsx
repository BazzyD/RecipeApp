import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, TextInput, Linking, ActivityIndicator } from 'react-native';
import AppLayout from '../components/AppLayout';

import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { uploadRecipeFromWeb } from '../ApiRequestSender';

type RootStackParamList = {
  Home: undefined;
  ShowRecipe: { recipe: any };
};

export default function UploadFromWebScreen() {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

   // Opens the 10dakot website in the external browser
  const handleOpenBrowser = () => {
    Linking.openURL('https://www.10dakot.co.il');
  };

  // Handles recipe upload from the provided URL
  const handleUpload = async () => {
  if (!url.trim()) {
      Toast.show({
        type: 'error',
        text1: 'URL Required',
        text2: 'Please enter a recipe URL before uploading.',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await uploadRecipeFromWeb(url);
      navigation.navigate('ShowRecipe', { recipe: result });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Recipe upload failed',
        text2: String(err?.message ?? 'Unknown error'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Text style={styles.label}>Choose Site</Text>

      <View style={styles.inputRow}>
        <Text style={styles.label}>URL:</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter recipe URL"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
        />

{/* Opens browser to known recipe source */}
        <TouchableOpacity style={styles.browserButton} onPress={handleOpenBrowser}>
          <Ionicons name="globe-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

{/* Upload button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>

       {/* Loading overlay shown during upload */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Uploading recipe...</Text>
        </View>
)}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginLeft: 8,
  },
  browserButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: 'tomato',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
   loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});
