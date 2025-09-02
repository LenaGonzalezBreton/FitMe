import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
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

export default function ExerciseDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { exercise } = route.params as { exercise: Exercise };

    const getIntensityLabel = (intensity: string): string => {
      switch (intensity) {
        case 'LOW': return 'Faible';
        case 'MEDIUM': return 'Modérée';
        case 'HIGH': return 'Élevée';
        default: return 'Non définie';
      }
    };

    const getIntensityColor = (intensity: string): string => {
      switch (intensity) {
        case 'LOW': return 'bg-success-100 text-success-700';
        case 'MEDIUM': return 'bg-warning-100 text-warning-700';
        case 'HIGH': return 'bg-error-100 text-error-700';
        default: return 'bg-secondary-100 text-secondary-700';
      }
    };

    const formatDuration = (minutes: number): string => {
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    return (
        <SafeAreaView className="flex-1 bg-brand-background">
            <ScrollView className="flex-1 px-4 py-6">
                {/* Header with back button */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        className="mr-4 p-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#8B5A3C" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-brand-text">Détails de l'exercice</Text>
                </View>

                {/* Exercise Title */}
                <Text className="text-3xl font-bold text-brand-text mb-4">{exercise.title}</Text>
                
                {/* Exercise Info Cards */}
                <View className="space-y-4 mb-6">
                    {/* Duration */}
                    <View className="bg-surface rounded-xl p-4 border border-border-light">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="time-outline" size={20} color="#8B5A3C" />
                            <Text className="text-lg font-semibold text-brand-text ml-2">Durée</Text>
                        </View>
                        <Text className="text-2xl font-bold text-primary-500">{formatDuration(exercise.duration)}</Text>
                    </View>

                    {/* Intensity */}
                    <View className="bg-surface rounded-xl p-4 border border-border-light">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="fitness-outline" size={20} color="#8B5A3C" />
                            <Text className="text-lg font-semibold text-brand-text ml-2">Intensité</Text>
                        </View>
                        <View className={`px-3 py-2 rounded-full self-start ${getIntensityColor(exercise.intensity)}`}>
                            <Text className="text-sm font-medium">{getIntensityLabel(exercise.intensity)}</Text>
                        </View>
                    </View>

                    {/* Category */}
                    <View className="bg-surface rounded-xl p-4 border border-border-light">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="grid-outline" size={20} color="#8B5A3C" />
                            <Text className="text-lg font-semibold text-brand-text ml-2">Catégorie</Text>
                        </View>
                        <View className="bg-primary-100 px-3 py-2 rounded-full self-start">
                            <Text className="text-primary-700 font-medium text-sm">{exercise.category}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View className="bg-surface rounded-xl p-4 border border-border-light mb-6">
                    <Text className="text-lg font-semibold text-brand-text mb-3">Description</Text>
                    <Text className="text-brand-text leading-6">{exercise.description}</Text>
                </View>

                {/* Muscle Groups */}
                {exercise.muscleGroups.length > 0 && (
                    <View className="bg-surface rounded-xl p-4 border border-border-light mb-6">
                        <Text className="text-lg font-semibold text-brand-text mb-3">Groupes musculaires</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {exercise.muscleGroups.map((muscle, index) => (
                                <View key={index} className="bg-accent-100 px-3 py-2 rounded-full">
                                    <Text className="text-accent-700 font-medium text-sm">{muscle}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Phase Recommendations */}
                {exercise.phaseRecommendations.length > 0 && (
                    <View className="bg-surface rounded-xl p-4 border border-border-light mb-6">
                        <Text className="text-lg font-semibold text-brand-text mb-3">Recommandations par phase</Text>
                        <View className="space-y-2">
                            {exercise.phaseRecommendations.map((recommendation, index) => (
                                <View key={index} className="flex-row items-start">
                                    <View className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2" />
                                    <Text className="text-brand-text flex-1">{recommendation}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Coming Soon Section */}
                <View className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#8B5A3C" />
                        <View className="flex-1 ml-3">
                            <Text className="text-primary-800 font-medium mb-1">Fonctionnalités à venir</Text>
                            <Text className="text-primary-700 text-sm">
                                • Vidéos et instructions détaillées{'\n'}
                                • Variations et progressions{'\n'}
                                • Historique des performances{'\n'}
                                • Intégration avec les programmes
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
