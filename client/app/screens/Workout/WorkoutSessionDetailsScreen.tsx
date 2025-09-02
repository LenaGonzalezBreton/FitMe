import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { workoutApi } from '../../services/api';

interface WorkoutExercise {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  sets?: number;
  reps?: string;
  restTime?: number;
  order: number;
}

interface WorkoutSessionDto {
  id: string;
  programTitle?: string;
  startTime: string | Date;
  endTime?: string | Date;
  exercises: WorkoutExercise[];
  isActive?: boolean;
}

export default function WorkoutSessionDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sessionId } = route.params as { sessionId: string };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<WorkoutSessionDto | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workoutApi.getWorkoutSession(sessionId);
      setSession(res.session || res.data || res);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la séance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <ScrollView className="flex-1 px-6">
          <View className="pt-16 pb-6">
            <Text className="text-3xl font-bold text-brand-text mb-2">Séance</Text>
          </View>
          <View className="items-center py-16">
            <Text className="text-6xl mb-4">⚠️</Text>
            <Text className="text-secondary-600">{error || 'Introuvable'}</Text>
            <TouchableOpacity onPress={load} className="mt-4 bg-primary-500 px-4 py-2 rounded-lg">
              <Text className="text-surface font-bold">Réessayer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const startedAt = new Date(session.startTime);

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView className="flex-1 px-6">
        <View className="pt-16 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2">
              <Ionicons name="arrow-back" size={24} color="#8B5A3C" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-brand-text">Séance</Text>
          </View>
          <Text className="text-lg font-bold text-brand-text">{session.programTitle || 'Séance'}</Text>
          <Text className="text-secondary-600">
            {startedAt.toLocaleDateString('fr-FR')} · {startedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-4">Exercices</Text>
          {session.exercises.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 border border-border-light items-center">
              <Text className="text-secondary-600">Aucun exercice</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {session.exercises
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((ex) => (
                <View key={ex.id} className="bg-surface rounded-xl p-4 border border-border-light">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-brand-text font-bold">{ex.title}</Text>
                    <Text className="text-secondary-600 text-xs"># {ex.order}</Text>
                  </View>
                  {ex.description ? (
                    <Text className="text-secondary-600 text-sm mb-2">{ex.description}</Text>
                  ) : null}
                  <View className="flex-row flex-wrap">
                    {ex.duration ? (
                      <View className="bg-primary-50 px-2 py-1 rounded mr-2 mb-2"><Text className="text-primary-700 text-xs">{ex.duration} min</Text></View>
                    ) : null}
                    {ex.sets ? (
                      <View className="bg-primary-50 px-2 py-1 rounded mr-2 mb-2"><Text className="text-primary-700 text-xs">{ex.sets} séries</Text></View>
                    ) : null}
                    {ex.reps ? (
                      <View className="bg-primary-50 px-2 py-1 rounded mr-2 mb-2"><Text className="text-primary-700 text-xs">{ex.reps} rép</Text></View>
                    ) : null}
                    {ex.restTime ? (
                      <View className="bg-primary-50 px-2 py-1 rounded mr-2 mb-2"><Text className="text-primary-700 text-xs">Repos {ex.restTime}s</Text></View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


