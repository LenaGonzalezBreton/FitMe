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
        <ScrollView className="flex-1 bg-brand-background px-4 py-6">
            <Text className="text-3xl font-bold text-black mb-4">{exercise.title}</Text>
            <Text className="text-xl font-semibold text-black mb-2">Phase conseillée : {exercise.phase}</Text>
            <Text className="text-base font-semibold text-black mb-2">Intensité : {exercise.intensity}</Text>
            <Text className="text-base font-semibold text-black mb-2">Durée : {exercise.duration}</Text>
            <Text className="text-xl font-semibold text-black mb-2">Catégorie : </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
                <Text className="px-3 py-2 bg-white rounded-full text-black font-medium text-xs">
                    {exercise.category}
                </Text>
            </View>
            <Text className="text-xl font-semibold text-black mb-2">Description de l'exercice :</Text>
            <Text className="text-base text-black mb-4">{exercise.description}</Text>
        </ScrollView>

    );
}
