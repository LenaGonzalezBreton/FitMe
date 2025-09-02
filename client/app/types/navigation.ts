export type AppStackParamList = {
  Main:           undefined;
  WorkoutSession: undefined;
  WorkoutSessionDetails: { sessionId: string };
  CreateProgram:  undefined;
  Exercices:      undefined;
  ExerciseDetail: { exerciseId: string };
  CycleTracking:  undefined;
  PeriodLogging:  undefined;
  PeriodHistory:  undefined;
};

export type AuthStackParamList = {
  Login:    undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};
