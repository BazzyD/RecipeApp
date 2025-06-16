import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/useAuthStore';

import Toast from 'react-native-toast-message';

type SideMenuProps = {
  onClose: () => void;
};

type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Login: undefined;
};

export default function SideMenu({ onClose }: SideMenuProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      onClose();
    } catch (error: any) {
      Toast.show({
            type: 'error',
            text1: 'Login failed',
            text2: error.message,
          });
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.menu}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>Close ✖️</Text>
        </TouchableOpacity>

        {!user ? (
          <>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                navigation.navigate('Register');
                onClose();
              }}
            >
              <Text style={styles.menuButtonText}>Register</Text>
            </TouchableOpacity>

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
        ) : (
          <>
            <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
              <Text style={styles.menuButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.background} onPress={onClose} />
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
