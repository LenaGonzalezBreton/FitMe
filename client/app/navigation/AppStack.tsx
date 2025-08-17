import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainPager from './MainPager';
import WorkoutSessionScreen from '../screens/Workout/WorkoutSessionScreen';
import CreateProgramScreen from '../screens/Programs/CreateProgramScreen';
import ExerciseDetailScreen from '../screens/Exercises/ExerciseDetailsScreen';
import ExercicesScreen from '../screens/Exercises/ExercicesScreen';
import { AppStackParamList } from '../types';   

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainPager} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
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
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="Exercices" component={ExercicesScreen} />
    </Stack.Navigator>
  );
}
