import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePrograms } from '../../hooks/usePrograms';
import { useCycleContext } from '../../context/CycleContext';
import { workoutApi } from '../../services/api';

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  title: string;
  description: string;
  duration: number;
  sets?: number;
  reps?: string;
  restTime?: number;
  order: number;
  completed: boolean;
}

interface WorkoutSession {
  id: string;
  programId: string;
  programTitle: string;
  startTime: Date;
  endTime?: Date;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  isActive: boolean;
}

const WorkoutSessionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { activeProgram } = usePrograms();
  const { currentCycle } = useCycleContext();
  
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize workout session from active program
  useEffect(() => {
    if (activeProgram) {
      initializeWorkoutSession();
    } else {
      setError('Aucun programme actif trouvé');
      setLoading(false);
    }
  }, [activeProgram]);

  const initializeWorkoutSession = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!activeProgram) {
        throw new Error('Aucun programme actif');
      }

      // Start workout session via API
      const response = await workoutApi.startWorkoutSession(activeProgram.id);
      setWorkoutSession(response.session);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'initialisation de la séance');
      console.error('Error initializing workout session:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExerciseCompletion = (exerciseId: string) => {
    if (!workoutSession) return;

    setWorkoutSession(prev => {
      if (!prev) return prev;
      
      const updatedExercises = prev.exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, completed: !exercise.completed }
          : exercise
      );

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const completeWorkoutSession = async () => {
    if (!workoutSession) return;

    try {
      setLoading(true);

      const completedExercises = workoutSession.exercises
        .filter(ex => ex.completed)
        .map(ex => ex.id);

      await workoutApi.completeWorkoutSession(workoutSession.id, {
        completedExercises,
        totalDuration: workoutSession.exercises.length * 5, // Rough estimate
      });

      Alert.alert(
        'Séance terminée !',
        'Félicitations pour avoir terminé votre entraînement !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Erreur', 'Impossible de terminer la séance. Veuillez réessayer.');
      console.error('Error completing workout session:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeWorkoutSession();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5A3C" />
          <Text className="text-brand-text mt-4">Préparation de votre séance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workoutSession) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <ScrollView className="flex-1 px-6">
          <View className="pt-16 pb-6">
            <Text className="text-3xl font-bold text-brand-text mb-2">Séance d'entraînement</Text>
          </View>
          
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">⚠️</Text>
            <Text className="text-xl font-bold text-brand-text mb-2 text-center">
              Impossible de démarrer la séance
            </Text>
            <Text className="text-secondary-600 text-center mb-6">
              {error || 'Une erreur est survenue'}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              className="bg-primary-500 py-3 px-6 rounded-xl"
            >
              <Text className="text-surface font-bold">Réessayer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const completedExercises = workoutSession.exercises.filter(ex => ex.completed).length;
  const totalExercises = workoutSession.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView 
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#8B5A3C" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-brand-text">Séance d'entraînement</Text>
            <View style={{ width: 24 }} />
          </View>
          
          {/* Program Info */}
          <View className="bg-surface rounded-xl p-4 border border-border-light mb-4">
            <Text className="text-lg font-bold text-brand-text mb-2">{workoutSession.programTitle}</Text>
            <Text className="text-sm text-secondary-600">
              Commencé à {workoutSession.startTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="bg-surface rounded-xl p-4 border border-border-light mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-brand-text">Progression</Text>
              <Text className="text-sm text-secondary-600">
                {completedExercises}/{totalExercises} exercices
              </Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View 
                className="bg-primary-500 h-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-xs text-secondary-500 mt-1">
              {Math.round(progress)}% terminé
            </Text>
          </View>
        </View>

        {/* Exercises List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-4">
            Exercices ({totalExercises})
          </Text>
          
          {workoutSession.exercises.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center border border-border-light">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-lg font-bold text-brand-text mb-2 text-center">
                Aucun exercice configuré
              </Text>
              <Text className="text-secondary-600 text-center">
                Ce programme n'a pas encore d'exercices détaillés.
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {workoutSession.exercises.map((exercise, index) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => toggleExerciseCompletion(exercise.id)}
                  className={`bg-surface rounded-xl p-4 border-2 ${
                    exercise.completed 
                      ? 'border-success-500 bg-success-50' 
                      : 'border-border-light'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                          exercise.completed ? 'bg-success-500' : 'bg-border'
                        }`}>
                          {exercise.completed && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </View>
                        <Text className={`text-lg font-bold ${
                          exercise.completed ? 'text-success-700' : 'text-brand-text'
                        }`}>
                          {exercise.title}
                        </Text>
                      </View>
                      
                      <Text className="text-sm text-secondary-600 mb-2">
                        {exercise.description}
                      </Text>
                      
                      <View className="flex-row space-x-4">
                        {exercise.duration > 0 && (
                          <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={16} color="#8B5A3C" />
                            <Text className="text-xs text-secondary-600 ml-1">
                              {exercise.duration} min
                            </Text>
                          </View>
                        )}
                        {exercise.sets && (
                          <View className="flex-row items-center">
                            <Ionicons name="repeat-outline" size={16} color="#8B5A3C" />
                            <Text className="text-xs text-secondary-600 ml-1">
                              {exercise.sets} séries
                            </Text>
                          </View>
                        )}
                        {exercise.reps && (
                          <View className="flex-row items-center">
                            <Ionicons name="fitness-outline" size={16} color="#8B5A3C" />
                            <Text className="text-xs text-secondary-600 ml-1">
                              {exercise.reps} rép
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Complete Workout Button */}
        {totalExercises > 0 && (
          <View className="mb-8">
            <TouchableOpacity
              onPress={completeWorkoutSession}
              disabled={completedExercises === 0}
              className={`py-4 rounded-xl items-center ${
                completedExercises > 0 
                  ? 'bg-success-500 active:bg-success-600' 
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`text-lg font-bold ${
                completedExercises > 0 ? 'text-surface' : 'text-gray-500'
              }`}>
                Terminer la séance
              </Text>
              <Text className={`text-sm ${
                completedExercises > 0 ? 'text-success-100' : 'text-gray-400'
              }`}>
                {completedExercises > 0 
                  ? `${completedExercises} exercice${completedExercises > 1 ? 's' : ''} terminé${completedExercises > 1 ? 's' : ''}`
                  : 'Complétez au moins un exercice'
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Coming Soon Section */}
        <View className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#8B5A3C" />
            <View className="flex-1 ml-3">
              <Text className="text-primary-800 font-medium mb-1">Fonctionnalités à venir</Text>
              <Text className="text-primary-700 text-sm">
                • Chronomètre intégré{'\n'}
                • Suivi des performances{'\n'}
                • Notifications de repos{'\n'}
                • Partage des résultats
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutSessionScreen; 