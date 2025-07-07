import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MainPager from './MainPager';
import CreateProgramScreen from '../screens/CreateProgramScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 