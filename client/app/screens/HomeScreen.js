import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const currentPhase = 'Folliculaire'; 
  const streakDays = 7;
  const nextWorkout = 'Squats + Cardio';

  const cyclePhases = [
    { name: 'Menstruelle', current: false, color: 'bg-brand-dark-secondary' },
    { name: 'Folliculaire', current: true, color: 'bg-primary-400' },
    { name: 'Ovulatoire', current: false, color: 'bg-brand-dark-secondary' },
    { name: 'Lutéale', current: false, color: 'bg-brand-dark-secondary' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-dark-bg">
      <ScrollView className="flex-1 px-6">
        {/* Header with proper spacing */}
        <View className="pt-16 pb-6">
          <Text className="text-lg text-brand-dark-secondary mb-1">Bonjour !</Text>
          <Text className="text-3xl font-bold text-brand-dark-text mb-6">Prête pour aujourd'hui ?</Text>
          
          {/* Streak Badge */}
          <View className="bg-brand-dark-surface rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-brand-dark-secondary mb-1">Série en cours</Text>
                <Text className="text-2xl font-bold text-brand-dark-text">{streakDays} jours</Text>
              </View>
              <Text className="text-4xl">🔥</Text>
            </View>
          </View>
        </View>

        {/* Current Phase Card */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-text mb-3">Phase actuelle</Text>
          <View className="bg-brand-dark-surface rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-brand-dark-text mb-1">{currentPhase}</Text>
                <Text className="text-sm text-brand-dark-secondary">Parfait pour les entraînements intensifs</Text>
              </View>
              <View className="bg-primary-500 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-white text-xl">💪</Text>
              </View>
            </View>
            {/* Phase Timeline */}
            <View className="flex-row space-x-2">
              {cyclePhases.map((phase) => (
                <View key={phase.name} className="flex-1 h-2 rounded-full">
                  <View className={`h-full rounded-full ${phase.current ? phase.color : 'bg-brand-dark-secondary'}`} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Next Workout */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-text mb-3">Prochain entraînement</Text>
          <TouchableOpacity 
            className="bg-brand-dark-brown-btn rounded-xl p-6"
            onPress={() => navigation.navigate('WorkoutSession')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-2">{nextWorkout}</Text>
                <Text className="text-primary-200 text-sm">Adapté à votre phase {currentPhase.toLowerCase()}</Text>
              </View>
              <View className="bg-white/20 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-white text-xl">▶️</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 
