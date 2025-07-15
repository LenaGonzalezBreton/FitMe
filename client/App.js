import React from 'react';
import AppNavigator from './app/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './app/context/AuthContext';

export default function App() {
  return (
    <>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </>
  );
}
