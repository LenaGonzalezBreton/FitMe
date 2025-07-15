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
      <ScrollView className="flex-1 bg-brand-cream px-4 py-6">
        <Text className="text-3xl font-bold text-black mb-4">{exercise.title}</Text>
          <Text className="text-lg font-semibold text-black">Phase adaptée : {exercise.phase}</Text>
          <Text className="text-base text-black mt-4 mb-2 font-semibold">Catégorie :</Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
              {exercise.muscles.map((muscle, idx) => (
                  <Text key={idx} className="px-3 py-2 bg-white rounded-full text-black text-xs">
                      {muscle}
                  </Text>
              ))}
          </View>
          <Text className="text-base text-black mt-4 mb-2 font-semibold">Muscles sollicités :</Text>
          <View className="flex-row flex-wrap gap-2">
              {exercise.muscles.map((muscle, idx) => (
                  <Text key={idx} className="px-3 py-2 bg-white rounded-full text-black text-xs">
                      {muscle}
                  </Text>
              ))}
          </View>

          <Text className="text-lg font-semibold text-black mt-6">Description de l'exercice :</Text>
          <Text className="text-base text-black mb-4">{exercise.description}</Text>
      </ScrollView>
  );
}
