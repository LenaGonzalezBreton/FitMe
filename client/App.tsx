import React from 'react';
import AppNavigator from './app/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './app/context/AuthContext';
import { CycleProvider } from './app/context/CycleContext';

export default function App() {
  return (
    <>
      <AuthProvider>
        <CycleProvider>
          <AppNavigator />
        </CycleProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </>
  );
}
