import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppLayout from '../components/AppLayout';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  // add other screens here
};

export default function LoginScreen() {
    const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});


  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: yupResolver(schema),
});

  const handleLogin = (data: { email: string; password: string }) => {
  console.log('Logging in with:', data);
};

  return (
        <AppLayout>
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <Controller
  control={control}
  name="email"
  render={({ field: { onChange, value } }) => (
    <>
      <TextInput
        placeholder="Email"
        style={[styles.input, errors.email && styles.inputError]}
        keyboardType="email-address"
        autoCapitalize="none"
        value={value}
        onChangeText={onChange}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
    </>
  )}
/>

<Controller
  control={control}
  name="password"
  render={({ field: { onChange, value } }) => (
    <>
      <TextInput
        placeholder="Password"
        style={[styles.input, errors.password && styles.inputError]}
        secureTextEntry
        value={value}
        onChangeText={onChange}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
    </>
  )}
/>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(handleLogin)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerLink}>Register</Text></Text>
      </TouchableOpacity>
    </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputError: {
  borderColor: 'blue',
},
errorText: {
  color: 'black',
  marginBottom: 10,
  marginLeft: 5,
},
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  registerLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
