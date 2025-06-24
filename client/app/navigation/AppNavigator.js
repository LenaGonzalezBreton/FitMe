import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CreateProgramScreen from '../screens/CreateProgramScreen';
import colors from 'tailwindcss/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.slate[50], // background
          },
          headerTintColor: colors.slate[800], // text-primary
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'FitMe' }} 
        />
        <Stack.Screen 
          name="CreateProgram" 
          component={CreateProgramScreen} 
          options={{ title: 'Nouveau Programme' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 