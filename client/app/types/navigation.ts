import type { Exercise } from '../screens/Exercises/types';
import type { Program } from '../screens/Programs/types';

export type AppStackParamList = {
  Main:           undefined;
  WorkoutSession: undefined;
  CreateProgram:  undefined;
  Exercices:      undefined;
  ExerciseDetail: { exercise: Exercise };
};

export type AuthStackParamList = {
  Login:    undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};
