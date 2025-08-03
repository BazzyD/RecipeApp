import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import UploadFromWebScreen from './src/screens/UploadFromWebScreen';
import UploadRecipeScreen from './src/screens/UploadRecipeScreen';
import ShowRecipeScreen from './src/screens/ShowRecipeScreen';
import RecipesScreen from './src/screens/RecipesScreen';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase/config';
import { useAuthStore } from './src/firebase/useAuthStore';

const Stack = createNativeStackNavigator();

export default function App() {
  // Access global auth store (Zustand)
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase listener to track user auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Save user UID or token to AsyncStorage
        const token = await firebaseUser.getIdToken();
        await AsyncStorage.setItem('userToken', token);
        // Also store user info in Zustand store
        setUser(firebaseUser);
      } else {
        // User signed out, remove from storage
        await AsyncStorage.removeItem('userToken');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // clean up listener on unmount
  }, [setUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Home' : "Login"}>
        {user ? (
          <>
            {/* Screens available when user is logged in */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ShowRecipe" component={ShowRecipeScreen} />
            <Stack.Screen name="UploadRecipe" component={UploadRecipeScreen} />
            <Stack.Screen name="UploadFromWeb" component={UploadFromWebScreen} />
            <Stack.Screen name="Recipes" component={RecipesScreen} />
          </>
        ) : (
          <>
            {/* Screens available when user is not logged in */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
      <Toast position="top" visibilityTime={3000} />{/* Tag for Global toast notifications in the app*/}
    </NavigationContainer>
  );
}
