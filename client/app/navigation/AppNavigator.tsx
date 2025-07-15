import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreateProgramScreen from '../screens/CreateProgramScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import { useAuth } from '../context/AuthContext';
import MainPager from './MainPager';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainPager} />
            <Stack.Screen
              name="WorkoutSession"
              component={WorkoutSessionScreen}
            />
            <Stack.Screen
              name="CreateProgram"
              component={CreateProgramScreen}
              options={{
                headerShown: true,
                title: 'Nouveau Programme',
                headerStyle: { backgroundColor: '#1C1C1E' },
                headerTintColor: '#FFFFFF',
                headerBackVisible: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 