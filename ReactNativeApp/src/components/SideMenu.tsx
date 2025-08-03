import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../firebase/useAuthStore';

import Toast from 'react-native-toast-message';

type SideMenuProps = {
  onClose: () => void;
};

type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Login: undefined;
  UploadRecipe: undefined;
  UploadFromWeb: undefined;
};

export default function SideMenu({ onClose }: SideMenuProps) {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user from global state
      onClose(); // Close menu after logout
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: String(err?.message ?? 'Unknown error'),
      });
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.menu}>
        {/* Close button at top of menu */}
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>Close </Text>
        </TouchableOpacity>

        {user ? (
          <>
            {/* Button to navigate to recipe upload screen */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                navigation.navigate('UploadRecipe');
                onClose();
              }}
            >
              <Text style={styles.menuButtonText}>Upload Recipe</Text>
            </TouchableOpacity>

            {/* Button to navigate to upload from a website */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                navigation.navigate('UploadFromWeb');
                onClose();
              }}
            >
              <Text style={styles.menuButtonText}>Upload Recipe From Web</Text>
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
              <Text style={styles.menuButtonText}>Logout</Text>
            </TouchableOpacity>

          </>
        ) : (
          <>
            {/* Register button if user not logged in */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                navigation.navigate('Register');
                onClose();
              }}
            >
              <Text style={styles.menuButtonText}>Register</Text>
            </TouchableOpacity>

            {/* Login button if user not logged in */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                navigation.navigate('Login');
                onClose();
              }}
            >
              <Text style={styles.menuButtonText}>Login</Text>
            </TouchableOpacity>
          </>
        )
        }
      </View>

      {/* Click outside menu to close it */}
      <TouchableOpacity style={styles.background} onPress={onClose} >
        <View />
        </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 0,
  },
  menu: {
    width: 250,
    backgroundColor: 'red',
    padding: 20
  },
  menuButton: {
    backgroundColor: '#F05501',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },

  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  background: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  close: {
    marginTop: 0,
    fontSize: 16,
    color: 'white',
  },
});
