import React from 'react';
import AppNavigator from './app/navigation/AppNavigator';
import { StatusBar } from "expo-status-bar";
import './global.css';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
