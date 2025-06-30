import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ExercicesScreen from '../screens/ExercicesScreen';
import ProgramScreen from '../screens/ProgramScreen';
import CreateProgramScreen from '../screens/CreateProgramScreen';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Main tab navigator with swipe functionality
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#f8fafc', // background color
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0', // border color
        },
        tabBarActiveTintColor: '#0891b2', // primary-500
        tabBarInactiveTintColor: '#64748b', // text-secondary
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#0891b2', // primary-500
          height: 3,
        },
        swipeEnabled: true,
        tabBarPressColor: '#cffafe', // primary-100 for ripple effect
      }}
    >
      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 16 }}>
              {focused ? '🏠' : '🏡'}
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Exercices" 
        component={ExercicesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 16 }}>
              {focused ? '💪' : '💪'}
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Programmes" 
        component={ProgramScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 16 }}>
              {focused ? '📋' : '📋'}
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8fafc', // background
          },
          headerTintColor: '#1e293b', // text-primary
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="CreateProgram" 
          component={CreateProgramScreen} 
          options={{ 
            title: 'Nouveau Programme',
            headerBackTitleVisible: false,
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 