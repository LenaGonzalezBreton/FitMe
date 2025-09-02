import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { AppStack } from './AppStack';

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Debug logging
  if (__DEV__) {
    console.log('AppNavigator - User:', user ? {
      id: user.id,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted
    } : 'No user');
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.onboardingCompleted ? (
        <AppStack />
      ) : (
        <OnboardingStack />
      )}
    </NavigationContainer>
  );
}
