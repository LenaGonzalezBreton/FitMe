import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const currentPhase = 'Folliculaire'; // This would come from user's cycle data
  const nextWorkout = 'Squats + Cardio';
  const streakDays = 7;

  const cyclePhases = [
    { name: 'Menstruelle', days: '1-5', current: false, color: 'bg-error' },
    { name: 'Folliculaire', days: '6-14', current: true, color: 'bg-primary-400' },
    { name: 'Ovulatoire', days: '15-17', current: false, color: 'bg-accent-400' },
    { name: 'Lutéale', days: '18-28', current: false, color: 'bg-primary-600' },
  ];

  const todayStats = [
    { label: 'Énergie', value: '85%', color: 'text-success' },
    { label: 'Motivation', value: 'Haute', color: 'text-primary-600' },
    { label: 'Récupération', value: 'Bonne', color: 'text-accent-600' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="py-6">
          <Text className="text-lg text-text-secondary mb-1">Bonjour !</Text>
          <Text className="text-3xl font-bold text-text-primary mb-4">Prête pour aujourd'hui ?</Text>
          
          {/* Streak Badge */}
          <View className="bg-primary-100 border border-primary-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-primary-700 mb-1">Série en cours</Text>
                <Text className="text-2xl font-bold text-primary-800">{streakDays} jours</Text>
              </View>
              <Text className="text-4xl">🔥</Text>
            </View>
          </View>
        </View>

        {/* Current Phase */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Phase actuelle</Text>
          <View className="bg-surface border border-border rounded-xl p-4 shadow-soft">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xl font-bold text-text-primary mb-1">{currentPhase}</Text>
                <Text className="text-sm text-text-secondary">Parfait pour les entraînements intensifs</Text>
              </View>
              <View className="bg-primary-500 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-white text-xl">💪</Text>
              </View>
            </View>
            
            {/* Phase Timeline */}
            <View className="flex-row space-x-2">
              {cyclePhases.map((phase, index) => (
                <View key={phase.name} className="flex-1">
                  <View className={`h-2 rounded-full ${
                    phase.current ? phase.color : 'bg-border'
                  }`} />
                  <Text className={`text-xs mt-1 text-center ${
                    phase.current ? 'text-text-primary font-medium' : 'text-text-tertiary'
                  }`}>
                    {phase.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Today's Stats */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Comment vous sentez-vous ?</Text>
          <View className="bg-surface border border-border rounded-xl p-4 shadow-soft">
            <View className="flex-row justify-between">
              {todayStats.map((stat, index) => (
                <View key={stat.label} className="items-center">
                  <Text className="text-sm text-text-secondary mb-1">{stat.label}</Text>
                  <Text className={`text-lg font-bold ${stat.color}`}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Next Workout */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Prochain entraînement</Text>
          <TouchableOpacity className="bg-primary-500 rounded-xl p-6 shadow-medium">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-2">{nextWorkout}</Text>
                <Text className="text-primary-100 text-sm">Adapté à votre phase {currentPhase.toLowerCase()}</Text>
              </View>
              <View className="bg-white/20 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-white text-xl">▶️</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-text-primary mb-3">Actions rapides</Text>
          <View className="space-y-3">
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-surface border border-border rounded-xl p-4 items-center shadow-soft"
                onPress={() => navigation.navigate('CreateProgram')}
              >
                <Text className="text-2xl mb-2">🎯</Text>
                <Text className="text-text-primary font-medium text-center">Créer Programme</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-surface border border-border rounded-xl p-4 items-center shadow-soft">
                <Text className="text-2xl mb-2">📊</Text>
                <Text className="text-text-primary font-medium text-center">Mes Stats</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-1 bg-surface border border-border rounded-xl p-4 items-center shadow-soft">
                <Text className="text-2xl mb-2">🗓️</Text>
                <Text className="text-text-primary font-medium text-center">Calendrier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-surface border border-border rounded-xl p-4 items-center shadow-soft">
                <Text className="text-2xl mb-2">💭</Text>
                <Text className="text-text-primary font-medium text-center">Journal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 