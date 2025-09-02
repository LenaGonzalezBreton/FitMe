import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { useCycle } from '../../hooks/useCycle';
import { exerciseApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  muscleGroups: string[];
  phaseRecommendations: string[];
  imageUrl?: string;
}

interface ExerciseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const ExercicesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentCycle } = useCycle();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'Exercices'>>();

  // Fetch exercises from API
  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await exerciseApi.getExercises();
      setExercises(response.exercises || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des exercices');
      console.error('Error fetching exercises:', err);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exercise categories from API
  const fetchCategories = async () => {
    try {
      const response = await exerciseApi.getCategories();
      setCategories(response.categories || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Fallback to default categories if API fails
      setCategories([
        { id: 'cardio', name: 'Cardio', icon: '💓', color: 'bg-accent-100' },
        { id: 'strength', name: 'Musculation', icon: '💪', color: 'bg-primary-100' },
        { id: 'flexibility', name: 'Flexibilité', icon: '🧘‍♀️', color: 'bg-primary-200' },
        { id: 'recovery', name: 'Récupération', icon: '🛁', color: 'bg-accent-200' },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchExercises(), fetchCategories()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchExercises();
    fetchCategories();
  }, []);

  // Filter exercises based on selected category
  const filteredExercises = selectedCategory === 'all'
    ? exercises
    : exercises.filter(exercise => exercise.category === selectedCategory);

  const getIntensityColor = (intensity: string): string => {
    switch (intensity) {
      case 'LOW': return 'bg-success-100 text-success-700';
      case 'MEDIUM': return 'bg-warning-100 text-warning-700';
      case 'HIGH': return 'bg-error-100 text-error-700';
      default: return 'bg-secondary-100 text-secondary-700';
    }
  };

  const getIntensityLabel = (intensity: string): string => {
    switch (intensity) {
      case 'LOW': return 'Faible';
      case 'MEDIUM': return 'Modérée';
      case 'HIGH': return 'Élevée';
      default: return 'Non définie';
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5A3C" />
          <Text className="text-brand-text mt-4">Chargement des exercices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <ScrollView className="flex-1 px-6">
          <View className="pt-16 pb-6">
            <Text className="text-3xl font-bold text-brand-text mb-2">Exercices</Text>
          </View>
          
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">🏗️</Text>
            <Text className="text-xl font-bold text-brand-text mb-2 text-center">
              En cours de développement
            </Text>
            <Text className="text-secondary-600 text-center mb-6">
              {error}
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

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView 
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="pt-16 pb-6">
          <Text className="text-3xl font-bold text-brand-text mb-2">Exercices</Text>
          {currentCycle && (
            <Text className="text-sm text-secondary-600">
              Recommandations adaptées à votre cycle (jour {currentCycle.cycleDay})
            </Text>
          )}
        </View>

        {/* Categories Filter */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              className={`mr-3 px-4 py-2 rounded-xl shadow-sm ${
                selectedCategory === 'all' ? 'bg-primary-500' : 'bg-surface border border-border'
              }`}
            >
              <Text className={`font-medium ${
                selectedCategory === 'all' ? 'text-surface' : 'text-brand-text'
              }`}>
                Tous
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`mr-3 px-4 py-2 rounded-xl flex-row items-center shadow-sm ${
                  selectedCategory === category.id ? 'bg-primary-500' : 'bg-surface border border-border'
                }`}
              >
                <Text className="mr-2">{category.icon}</Text>
                <Text className={`font-medium ${
                  selectedCategory === category.id ? 'text-surface' : 'text-brand-text'
                }`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercises List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-4">
            {selectedCategory === 'all' ? 'Tous les exercices' : `Exercices ${categories.find(c => c.id === selectedCategory)?.name}`} 
            ({filteredExercises.length})
          </Text>
          
          {filteredExercises.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center shadow-sm border border-border-light">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-lg font-bold text-brand-text mb-2 text-center">
                Aucun exercice disponible
              </Text>
              <Text className="text-secondary-600 text-center">
                {selectedCategory === 'all' 
                  ? 'Les exercices seront bientôt disponibles via l\'API'
                  : `Aucun exercice trouvé dans la catégorie ${categories.find(c => c.id === selectedCategory)?.name}`
                }
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  className="bg-surface rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-border-light active:bg-surface-secondary"
                  onPress={() => navigation.navigate('ExerciseDetail', { exercise })}
                >
                  <View className="items-center mb-3">
                    {exercise.imageUrl ? (
                      <Image 
                        source={{ uri: exercise.imageUrl }} 
                        className="w-24 h-24 rounded-lg" 
                        resizeMode="cover" 
                      />
                    ) : (
                      <View className="w-24 h-24 bg-primary-100 rounded-lg items-center justify-center">
                        <Ionicons name="fitness" size={32} color="#8B5A3C" />
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-brand-text font-bold text-center text-base mb-1">
                    {exercise.title}
                  </Text>
                  
                  <Text className="text-secondary-600 text-center text-sm mb-2">
                    {formatDuration(exercise.duration)}
                  </Text>
                  
                  <View className="flex-row justify-center mb-2">
                    <View className={`px-2 py-1 rounded-full ${getIntensityColor(exercise.intensity)}`}>
                      <Text className="text-xs font-medium">
                        {getIntensityLabel(exercise.intensity)}
                      </Text>
                    </View>
                  </View>
                  
                  {exercise.muscleGroups.length > 0 && (
                    <Text className="text-xs text-secondary-500 text-center">
                      {exercise.muscleGroups.slice(0, 2).join(', ')}
                      {exercise.muscleGroups.length > 2 && '...'}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Coming Soon Section */}
        <View className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#8B5A3C" />
            <View className="flex-1 ml-3">
              <Text className="text-primary-800 font-medium mb-1">Fonctionnalités à venir</Text>
              <Text className="text-primary-700 text-sm">
                • Recherche et filtres avancés{'\n'}
                • Recommandations personnalisées selon votre cycle{'\n'}
                • Vidéos et instructions détaillées{'\n'}
                • Historique des exercices pratiqués
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExercicesScreen; 
