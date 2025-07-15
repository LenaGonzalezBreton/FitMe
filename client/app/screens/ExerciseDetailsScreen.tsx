import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const { exercise } = route.params as {
    exercise: {
        id: number;
        title: string;
        duration: string;
        intensity: 'Très léger' | 'Léger' | 'Modéré' | 'Intense';
        phase: string;
        category: 'cardio' | 'strength' | 'flexibility' | 'recovery';
        description: string;
        muscles: string[];
    };
  };

  return (
      <ScrollView className="flex-1 bg-black px-4 py-6">
        <Text className="text-3xl font-bold text-white mb-4">{exercise.title}</Text>
        <Text className="text-base text-gray-300 mb-4">{exercise.description}</Text>
        <Text className="text-white mb-2">Intensité : {exercise.intensity}</Text>
        <Text className="text-white mb-2">Durée : {exercise.duration}</Text>
        <Text className="text-white mb-2">Catégorie : {exercise.category}</Text>
        <Text className="text-white mb-2">🌙 Phase conseillée : {exercise.phase}</Text>

        <Text className="text-white mt-4 mb-2 font-semibold">Muscles sollicités :</Text>
        <View className="flex-row flex-wrap gap-2">
          {exercise.muscles.map((muscle, idx) => (
              <Text key={idx} className="px-2 py-1 bg-purple-600 rounded-full text-white text-xs">
                {muscle}
              </Text>
          ))}
        </View>
      </ScrollView>
  );
}
