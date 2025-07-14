import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import UploadFromWebScreen from './src/screens/UploadFromWebScreen';
import UploadRecipeScreen from './src/screens/UploadRecipeScreen';
import ShowRecipeScreen from './src/screens/ShowRecipeScreen';
import RecipesScreen from './src/screens/RecipesScreen';

import { onAuthStateChanged } from 'firebase/auth';
import { auth}  from './src/firebase/config';
import { useAuthStore } from './src/firebase/useAuthStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe; // clean up listener on unmount
  }, [setUser]);

  if (loading) return null; // or a splash screen

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Home' : "Login"}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ShowRecipe" component={ShowRecipeScreen}/>
            <Stack.Screen name="UploadRecipe" component={UploadRecipeScreen}/>
            <Stack.Screen name="UploadFromWeb" component={UploadFromWebScreen}/>
            <Stack.Screen name="Recipes" component={RecipesScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
