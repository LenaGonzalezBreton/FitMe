import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

const EXERCISE_CATEGORIES = [
  { id: 'cardio', name: 'Cardio', icon: '💓', color: 'bg-accent-100' },
  { id: 'strength', name: 'Musculation', icon: '💪', color: 'bg-primary-100' },
  { id: 'flexibility', name: 'Flexibilité', icon: '🧘‍♀️', color: 'bg-primary-200' },
  { id: 'recovery', name: 'Récupération', icon: '🛁', color: 'bg-accent-200' },
];

const SAMPLE_EXERCISES = [
  {
    id: 1,
    title: 'Squats',
    duration: '15 min',
    intensity: 'Modéré',
    phase: 'Folliculaire',
    category: 'strength',
    description: 'Exercice complet pour les jambes et fessiers'
  },
  {
    id: 2,
    title: 'Marche rapide',
    duration: '30 min',
    intensity: 'Léger',
    phase: 'Menstruelle',
    category: 'cardio',
    description: 'Cardio doux parfait pendant les règles'
  },
  {
    id: 3,
    title: 'Yoga restauratif',
    duration: '20 min',
    intensity: 'Très léger',
    phase: 'Lutéale',
    category: 'recovery',
    description: 'Étirements et relaxation profonde'
  },
  {
    id: 4,
    title: 'HIIT',
    duration: '25 min',
    intensity: 'Intense',
    phase: 'Ovulatoire',
    category: 'cardio',
    description: 'Entraînement fractionné haute intensité'
  },
];

const ExercicesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPhase] = useState('Folliculaire'); // This would come from user's cycle data

  const filteredExercises = selectedCategory === 'all' 
    ? SAMPLE_EXERCISES 
    : SAMPLE_EXERCISES.filter(exercise => exercise.category === selectedCategory);

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Très léger': return 'bg-success text-white';
      case 'Léger': return 'bg-warning text-white';
      case 'Modéré': return 'bg-primary-500 text-white';
      case 'Intense': return 'bg-accent-500 text-white';
      default: return 'bg-text-tertiary text-white';
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'Menstruelle': return 'bg-error text-white';
      case 'Folliculaire': return 'bg-primary-400 text-white';
      case 'Ovulatoire': return 'bg-accent-400 text-white';
      case 'Lutéale': return 'bg-primary-600 text-white';
      default: return 'bg-text-tertiary text-white';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="py-6">
          <Text className="text-3xl font-bold text-text-primary mb-2">Exercices</Text>
          <Text className="text-base text-text-secondary">
            Phase actuelle : <Text className="font-semibold text-primary-600">{currentPhase}</Text>
          </Text>
        </View>

        {/* Categories Filter */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              className={`mr-3 px-4 py-2 rounded-xl ${
                selectedCategory === 'all' ? 'bg-primary-500' : 'bg-surface border border-border'
              }`}
            >
              <Text className={`font-medium ${
                selectedCategory === 'all' ? 'text-white' : 'text-text-primary'
              }`}>
                Tous
              </Text>
            </TouchableOpacity>
            
            {EXERCISE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`mr-3 px-4 py-2 rounded-xl flex-row items-center ${
                  selectedCategory === category.id ? 'bg-primary-500' : 'bg-surface border border-border'
                }`}
              >
                <Text className="mr-2">{category.icon}</Text>
                <Text className={`font-medium ${
                  selectedCategory === category.id ? 'text-white' : 'text-text-primary'
                }`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercises List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Recommandés pour vous ({filteredExercises.length})
          </Text>
          
          {filteredExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              className="bg-surface border border-border rounded-xl p-4 mb-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-text-primary mb-1">
                    {exercise.title}
                  </Text>
                  <Text className="text-sm text-text-secondary mb-2">
                    {exercise.description}
                  </Text>
                  <Text className="text-sm text-text-tertiary">
                    {exercise.duration}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row space-x-2">
                  <View className={`px-3 py-1 rounded-full ${getIntensityColor(exercise.intensity)}`}>
                    <Text className="text-xs font-medium">{exercise.intensity}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${getPhaseColor(exercise.phase)}`}>
                    <Text className="text-xs font-medium">{exercise.phase}</Text>
                  </View>
                </View>
                
                <TouchableOpacity className="bg-primary-500 px-4 py-2 rounded-lg">
                  <Text className="text-white font-medium text-sm">Commencer</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-text-primary mb-4">Actions rapides</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-primary-100 border border-primary-200 rounded-xl p-4 items-center">
              <Text className="text-2xl mb-2">🎯</Text>
              <Text className="text-primary-700 font-medium text-center">Créer un programme</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-1 bg-accent-100 border border-accent-200 rounded-xl p-4 items-center">
              <Text className="text-2xl mb-2">📊</Text>
              <Text className="text-accent-700 font-medium text-center">Voir mes stats</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExercicesScreen; 
