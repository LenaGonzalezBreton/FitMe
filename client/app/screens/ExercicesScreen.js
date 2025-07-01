import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import Tag from '../components/Tag';

const ExercicesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const currentPhase = 'Folliculaire';

  const exerciseCategories = [
  { id: 'cardio', name: 'Cardio', icon: '💓', color: 'bg-accent-100' },
  { id: 'strength', name: 'Musculation', icon: '💪', color: 'bg-primary-100' },
  { id: 'flexibility', name: 'Flexibilité', icon: '🧘‍♀️', color: 'bg-primary-200' },
  { id: 'recovery', name: 'Récupération', icon: '🛁', color: 'bg-accent-200' },
];

  const sampleExercises = [
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
    title: 'HIIT',
    duration: '25 min',
    intensity: 'Intense',
    phase: 'Ovulatoire',
    category: 'cardio',
    description: 'Entraînement fractionné haute intensité'
  },
    {
      id: 4,
      title: 'Yoga restauratif',
      duration: '20 min',
      intensity: 'Très léger',
      phase: 'Lutéale',
      category: 'flexibility',
      description: 'Étirements et relaxation profonde'
    },
    {
      id: 5,
      title: 'Pompes',
      duration: '10 min',
      intensity: 'Modéré',
      phase: 'Folliculaire',
      category: 'strength',
      description: 'Renforcement du haut du corps'
    },
    {
      id: 6,
      title: 'Méditation',
      duration: '15 min',
      intensity: 'Très léger',
      phase: 'Menstruelle',
      category: 'recovery',
      description: 'Relaxation et bien-être mental'
    },
  ];

  // Filter exercises based on selected category
  const filteredExercises = selectedCategory === 'all' 
    ? sampleExercises 
    : sampleExercises.filter(exercise => exercise.category === selectedCategory);

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Très léger': return 'bg-primary-200 text-primary-800';
      case 'Léger': return 'bg-success text-white';
      case 'Modéré': return 'bg-primary-500 text-white';
      case 'Intense': return 'bg-accent-500 text-white';
      default: return 'bg-text-tertiary text-white';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark-bg">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-16 pb-6">
          <Text className="text-3xl font-bold text-brand-dark-text mb-2">Exercices</Text>
          <Text className="text-base text-brand-dark-secondary">
            Phase actuelle : <Text className="font-semibold text-primary-400">{currentPhase}</Text>
          </Text>
        </View>

        {/* Categories Filter */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-text mb-3">Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              className={`mr-3 px-4 py-2 rounded-xl ${
                selectedCategory === 'all' ? 'bg-primary-500' : 'bg-brand-dark-surface'
              }`}
            >
              <Text className={`font-medium ${
                selectedCategory === 'all' ? 'text-white' : 'text-brand-dark-text'
              }`}>
                Tous
              </Text>
            </TouchableOpacity>
            
            {exerciseCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`mr-3 px-4 py-2 rounded-xl flex-row items-center ${
                  selectedCategory === category.id ? 'bg-primary-500' : 'bg-brand-dark-surface'
                }`}
              >
                <Text className="mr-2">{category.icon}</Text>
                <Text className={`font-medium ${
                  selectedCategory === category.id ? 'text-white' : 'text-brand-dark-text'
                }`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercises List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-text mb-4">
            Recommandés pour vous ({filteredExercises.length})
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {filteredExercises.map((exercise) => (
              <TouchableOpacity 
                key={exercise.id}
                className="bg-brand-dark-surface rounded-xl p-4 mb-4 w-[48%]"
              >
                <View className="items-center mb-3">
                  <Image source={require('../../assets/logo.png')} className="w-24 h-24" resizeMode="contain" />
                </View>
                <Text className="text-white font-bold text-center text-base mb-1">{exercise.title}</Text>
                <Text className="text-brand-dark-secondary text-center text-sm">{exercise.duration}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExercicesScreen; 
