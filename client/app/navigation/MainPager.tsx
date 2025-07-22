import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import ExercicesScreen from '../screens/Exercises/ExercicesScreen';
import ChronometerScreen from '../screens/Chronometer/ChronometerScreen';
import ProgramScreen from '../screens/Programs/ProgramScreen';

const Tab = createMaterialTopTabNavigator();

const MainPager = () => {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#F5EFE6',
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#0891b2', // primary-500
        },
        tabBarIcon: () => <></>, // Hiding icons as well
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Programmes" component={ProgramScreen} />
      <Tab.Screen name="Exercices" component={ExercicesScreen} />
      <Tab.Screen name="Chrono" component={ChronometerScreen} />
    </Tab.Navigator>
  );
};

export default MainPager; 