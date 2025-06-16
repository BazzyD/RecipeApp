import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AppLayout from '../components/AppLayout';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

import Toast from 'react-native-toast-message';


// 1. Define Yup schema for validation
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  // add other screens here
};


export default function RegisterScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
 const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // 3. On submit
  const onSubmit = async (data: { email: string; password: string }) => {
  try {
    await createUserWithEmailAndPassword(auth, data.email, data.password);

    navigation.navigate('Login');
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Register failed',
      text2: error.message,
    });
  }
};

  return (
        <AppLayout>
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Name input */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Name"
              style={[styles.input, errors.name && styles.inputError]}
              value={value}
              onChangeText={onChange}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </>
        )}
      />

      {/* Email input */}
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

      {/* Password input */}
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

      {/* Confirm Password input */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Confirm Password"
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
          </>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Register</Text>
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
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'blue',
  },
  errorText: {
    color: 'black',
    marginBottom: 10,
    marginLeft: 5,
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
});
